'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.onEnterKey', onEnterKey), vscode_1.commands.registerCommand('markdown.extension.onCtrlEnterKey', () => { onEnterKey('ctrl'); }), vscode_1.commands.registerCommand('markdown.extension.onShiftEnterKey', () => { onEnterKey('shift'); }), vscode_1.commands.registerCommand('markdown.extension.onTabKey', onTabKey), vscode_1.commands.registerCommand('markdown.extension.onShiftTabKey', () => { onTabKey('shift'); }), vscode_1.commands.registerCommand('markdown.extension.onBackspaceKey', onBackspaceKey), vscode_1.commands.registerCommand('markdown.extension.checkTaskList', checkTaskList), vscode_1.commands.registerCommand('markdown.extension.onMoveLineDown', onMoveLineDown), vscode_1.commands.registerCommand('markdown.extension.onMoveLineUp', onMoveLineUp), vscode_1.commands.registerCommand('markdown.extension.onCopyLineDown', onCopyLineDown), vscode_1.commands.registerCommand('markdown.extension.onCopyLineUp', onCopyLineUp), vscode_1.commands.registerCommand('markdown.extension.onIndentLines', onIndentLines), vscode_1.commands.registerCommand('markdown.extension.onOutdentLines', onOutdentLines));
}
exports.activate = activate;
function isInFencedCodeBlock(doc, lineNum) {
    let textBefore = doc.getText(new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(lineNum, 0)));
    let matches = textBefore.match(/```.*\r?\n/g);
    if (matches == null) {
        return false;
    }
    else {
        return matches.length % 2 != 0;
    }
}
function onEnterKey(modifiers) {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let line = editor.document.lineAt(cursorPos.line);
    let textBeforeCursor = line.text.substr(0, cursorPos.character);
    let textAfterCursor = line.text.substr(cursorPos.character);
    let lineBreakPos = cursorPos;
    if (modifiers == 'ctrl') {
        lineBreakPos = line.range.end;
    }
    if (modifiers == 'shift' || isInFencedCodeBlock(editor.document, cursorPos.line)) {
        return asNormal('enter', modifiers);
    }
    // If it's an empty list item, remove it
    if (/^(>|([-+*]|[0-9]+[.)])( +\[[ x]\])?)$/.test(textBeforeCursor.trim()) && textAfterCursor.trim().length == 0) {
        return editor.edit(editBuilder => {
            editBuilder.delete(line.range);
            editBuilder.insert(line.range.end, '\n');
        }).then(() => {
            editor.revealRange(editor.selection);
        }).then(() => fixMarker(findNextMarkerLineNumber()));
    }
    let matches;
    if (/^> /.test(textBeforeCursor)) {
        // Quote block
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n> `);
        }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, 2);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => { editor.revealRange(editor.selection); });
    }
    else if ((matches = /^(\s*[-+*] +(\[[ x]\] +)?)/.exec(textBeforeCursor)) !== null) {
        // Unordered list
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n${matches[1].replace('[x]', '[ ]')}`);
        }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, matches[1].length);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => { editor.revealRange(editor.selection); });
    }
    else if ((matches = /^(\s*)([0-9]+)([.)])( +)((\[[ x]\] +)?)/.exec(textBeforeCursor)) !== null) {
        // Ordered list
        let config = vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker');
        let marker = '1';
        let leadingSpace = matches[1];
        let previousMarker = matches[2];
        let delimiter = matches[3];
        let trailingSpace = matches[4];
        let gfmCheckbox = matches[5].replace('[x]', '[ ]');
        let textIndent = (previousMarker + delimiter + trailingSpace).length;
        if (config == 'ordered') {
            marker = String(Number(previousMarker) + 1);
        }
        // Add enough trailing spaces so that the text is aligned with the previous list item, but always keep at least one space
        trailingSpace = " ".repeat(Math.max(1, textIndent - (marker + delimiter).length));
        const toBeAdded = leadingSpace + marker + delimiter + trailingSpace + gfmCheckbox;
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n${toBeAdded}`);
        }, { undoStopBefore: true, undoStopAfter: false }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, toBeAdded.length);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => fixMarker()).then(() => { editor.revealRange(editor.selection); });
    }
    else {
        return asNormal('enter', modifiers);
    }
}
function onTabKey(modifiers) {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.start;
    let lineText = editor.document.lineAt(cursorPos.line).text;
    if (isInFencedCodeBlock(editor.document, cursorPos.line)) {
        return asNormal('tab', modifiers);
    }
    let match = /^\s*([-+*]|[0-9]+[.)]) +(\[[ x]\] +)?/.exec(lineText);
    if (match
        && (modifiers === 'shift'
            || !editor.selection.isEmpty
            || editor.selection.isEmpty && cursorPos.character <= match[0].length)) {
        if (modifiers === 'shift') {
            return outdent(editor).then(() => fixMarker());
        }
        else {
            return indent(editor).then(() => fixMarker());
        }
    }
    else {
        return asNormal('tab', modifiers);
    }
}
function onBackspaceKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursor = editor.selection.active;
    let document = editor.document;
    let textBeforeCursor = document.lineAt(cursor.line).text.substr(0, cursor.character);
    if (isInFencedCodeBlock(document, cursor.line)) {
        return asNormal('backspace');
    }
    if (!editor.selection.isEmpty) {
        return asNormal('backspace').then(() => fixMarker(findNextMarkerLineNumber()));
    }
    else if (/^\s+([-+*]|[0-9]+[.)]) +(\[[ x]\] )?$/.test(textBeforeCursor)) {
        return outdent(editor).then(() => fixMarker());
    }
    else if (/^([-+*]|[0-9]+[.)]) $/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor == '- ', '1. '
        return editor.edit(editBuilder => {
            editBuilder.replace(new vscode_1.Range(cursor.with({ character: 0 }), cursor), ' '.repeat(textBeforeCursor.length));
        }).then(() => fixMarker(findNextMarkerLineNumber()));
    }
    else if (/^([-+*]|[0-9]+[.)]) +(\[[ x]\] )$/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor == '- [ ]', '1. [x]'
        return deleteRange(editor, new vscode_1.Range(cursor.with({ character: textBeforeCursor.length - 4 }), cursor)).then(() => fixMarker(findNextMarkerLineNumber()));
    }
    else {
        return asNormal('backspace');
    }
}
function asNormal(key, modifiers) {
    switch (key) {
        case 'enter':
            if (modifiers === 'ctrl') {
                return vscode_1.commands.executeCommand('editor.action.insertLineAfter');
            }
            else {
                return vscode_1.commands.executeCommand('type', { source: 'keyboard', text: '\n' });
            }
        case 'tab':
            if (vscode_1.workspace.getConfiguration('emmet').get('triggerExpansionOnTab')) {
                return vscode_1.commands.executeCommand('editor.emmet.action.expandAbbreviation');
            }
            else if (modifiers === 'shift') {
                return vscode_1.commands.executeCommand('editor.action.outdentLines');
            }
            else {
                return vscode_1.commands.executeCommand('tab');
            }
        case 'backspace':
            return vscode_1.commands.executeCommand('deleteLeft');
    }
}
/**
 * If
 *
 * 1. it is not the first line
 * 2. there is a Markdown list item before this line
 *
 * then indent the current line to align with the previous list item.
 */
function indent(editor) {
    if (!editor) {
        editor = vscode_1.window.activeTextEditor;
    }
    if (vscode_1.workspace.getConfiguration("markdown.extension.list", editor.document.uri).get("indentationSize") === "adaptive") {
        try {
            const selection = editor.selection;
            const indentationSize = tryDetermineIndentationSize(editor, selection.start.line, editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex);
            let edit = new vscode_1.WorkspaceEdit();
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                if (i === selection.end.line && !selection.isEmpty && selection.end.character === 0) {
                    break;
                }
                if (editor.document.lineAt(i).text.length !== 0) {
                    edit.insert(editor.document.uri, new vscode_1.Position(i, 0), ' '.repeat(indentationSize));
                }
            }
            return vscode_1.workspace.applyEdit(edit);
        }
        catch (error) { }
    }
    return vscode_1.commands.executeCommand('editor.action.indentLines');
}
/**
 * Similar to `indent`-function
 */
function outdent(editor) {
    if (!editor) {
        editor = vscode_1.window.activeTextEditor;
    }
    if (vscode_1.workspace.getConfiguration("markdown.extension.list", editor.document.uri).get("indentationSize") === "adaptive") {
        try {
            const selection = editor.selection;
            const indentationSize = tryDetermineIndentationSize(editor, selection.start.line, editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex);
            let edit = new vscode_1.WorkspaceEdit();
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                if (i === selection.end.line && !selection.isEmpty && selection.end.character === 0) {
                    break;
                }
                const lineText = editor.document.lineAt(i).text;
                let maxOutdentSize;
                if (lineText.trim().length === 0) {
                    maxOutdentSize = lineText.length;
                }
                else {
                    maxOutdentSize = editor.document.lineAt(i).firstNonWhitespaceCharacterIndex;
                }
                if (maxOutdentSize > 0) {
                    edit.delete(editor.document.uri, new vscode_1.Range(i, 0, i, Math.min(indentationSize, maxOutdentSize)));
                }
            }
            return vscode_1.workspace.applyEdit(edit);
        }
        catch (error) { }
    }
    return vscode_1.commands.executeCommand('editor.action.outdentLines');
}
function tryDetermineIndentationSize(editor, line, currentIndentation) {
    while (--line >= 0) {
        const lineText = editor.document.lineAt(line).text;
        let matches;
        if ((matches = /^(\s*)(([-+*]|[0-9]+[.)]) +)(\[[ x]\] +)?/.exec(lineText)) !== null) {
            if (matches[1].length <= currentIndentation) {
                return matches[2].length;
            }
        }
    }
    throw "No previous Markdown list item";
}
/**
 * Returns the line number of the next ordered list item starting either from
 * the specified line or the beginning of the current selection.
 */
function findNextMarkerLineNumber(line) {
    let editor = vscode_1.window.activeTextEditor;
    if (line === undefined) {
        // Use start.line instead of active.line so that we can find the first
        // marker following either the cursor or the entire selected range
        line = editor.selection.start.line;
    }
    while (line < editor.document.lineCount) {
        const lineText = editor.document.lineAt(line).text;
        if (/^\s*[0-9]+[.)] +/.exec(lineText) !== null) {
            return line;
        }
        line++;
    }
    return undefined;
}
/**
 * Looks for the previous ordered list marker at the same indentation level
 * and returns the marker number that should follow it.
 *
 * @returns the fixed marker number
 */
function lookUpwardForMarker(editor, line, currentIndentation) {
    while (--line >= 0) {
        const lineText = editor.document.lineAt(line).text;
        let matches;
        if ((matches = /^(\s*)(([0-9]+)[.)] +)/.exec(lineText)) !== null) {
            let leadingSpace = matches[1];
            let marker = matches[3];
            if (leadingSpace.length === currentIndentation) {
                return Number(marker) + 1;
            }
            else if ((!leadingSpace.includes('\t') && leadingSpace.length + matches[2].length <= currentIndentation)
                || leadingSpace.includes('\t') && leadingSpace.length + 1 <= currentIndentation) {
                return 1;
            }
        }
        else if ((matches = /^(\s*)\S/.exec(lineText)) !== null) {
            if (matches[1].length <= currentIndentation) {
                break;
            }
        }
    }
    return 1;
}
/**
 * Fix ordered list marker *iteratively* starting from current line
 */
function fixMarker(line) {
    if (!vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('autoRenumber'))
        return;
    if (vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker') == 'one')
        return;
    let editor = vscode_1.window.activeTextEditor;
    if (line === undefined) {
        // Use either the first line containing an ordered list marker within the selection or the active line
        line = findNextMarkerLineNumber();
        if (line === undefined || line > editor.selection.end.line) {
            line = editor.selection.active.line;
        }
    }
    if (line < 0 || editor.document.lineCount <= line) {
        return;
    }
    let currentLineText = editor.document.lineAt(line).text;
    let matches;
    if ((matches = /^(\s*)([0-9]+)([.)])( +)/.exec(currentLineText)) !== null) { // ordered list
        let leadingSpace = matches[1];
        let marker = matches[2];
        let delimiter = matches[3];
        let trailingSpace = matches[4];
        let fixedMarker = lookUpwardForMarker(editor, line, leadingSpace.length);
        let listIndent = marker.length + delimiter.length + trailingSpace.length;
        let fixedMarkerString = String(fixedMarker);
        return editor.edit(editBuilder => {
            if (marker === fixedMarkerString) {
                return;
            }
            // Add enough trailing spaces so that the text is still aligned at the same indentation level as it was previously, but always keep at least one space
            fixedMarkerString += delimiter + " ".repeat(Math.max(1, listIndent - (fixedMarkerString + delimiter).length));
            editBuilder.replace(new vscode_1.Range(line, leadingSpace.length, line, leadingSpace.length + listIndent), fixedMarkerString);
        }, { undoStopBefore: false, undoStopAfter: false }).then(() => {
            let nextLine = line + 1;
            let indentString = " ".repeat(listIndent);
            while (editor.document.lineCount > nextLine) {
                const nextLineText = editor.document.lineAt(nextLine).text;
                if (/^\s*[0-9]+[.)] +/.test(nextLineText)) {
                    return fixMarker(nextLine);
                }
                else if (/^\s*$/.test(nextLineText)) {
                    nextLine++;
                }
                else if (listIndent <= 4 && !nextLineText.startsWith(indentString)) {
                    return;
                }
                else {
                    nextLine++;
                }
            }
        });
    }
}
function deleteRange(editor, range) {
    return editor.edit(editBuilder => {
        editBuilder.delete(range);
    }, 
    // We will enable undoStop after fixing markers
    { undoStopBefore: true, undoStopAfter: false });
}
function checkTaskList() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let line = editor.document.lineAt(cursorPos.line).text;
    let matches;
    if (matches = /^(\s*([-+*]|[0-9]+[.)]) +\[) \]/.exec(line)) {
        return editor.edit(editBuilder => {
            editBuilder.replace(new vscode_1.Range(cursorPos.with({ character: matches[1].length }), cursorPos.with({ character: matches[1].length + 1 })), 'x');
        });
    }
    else if (matches = /^(\s*([-+*]|[0-9]+[.)]) +\[)x\]/.exec(line)) {
        return editor.edit(editBuilder => {
            editBuilder.replace(new vscode_1.Range(cursorPos.with({ character: matches[1].length }), cursorPos.with({ character: matches[1].length + 1 })), ' ');
        });
    }
}
function onMoveLineUp() {
    return vscode_1.commands.executeCommand('editor.action.moveLinesUpAction')
        .then(() => fixMarker());
}
function onMoveLineDown() {
    return vscode_1.commands.executeCommand('editor.action.moveLinesDownAction')
        .then(() => fixMarker(findNextMarkerLineNumber(vscode_1.window.activeTextEditor.selection.start.line - 1)));
}
function onCopyLineUp() {
    return vscode_1.commands.executeCommand('editor.action.copyLinesUpAction')
        .then(() => fixMarker());
}
function onCopyLineDown() {
    return vscode_1.commands.executeCommand('editor.action.copyLinesDownAction')
        .then(() => fixMarker());
}
function onIndentLines() {
    return indent().then(() => fixMarker());
}
function onOutdentLines() {
    return outdent().then(() => fixMarker());
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=listEditing.js.map