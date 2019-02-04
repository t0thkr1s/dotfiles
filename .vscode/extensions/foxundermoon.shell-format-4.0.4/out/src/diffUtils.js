"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const pathUtil_1 = require("./pathUtil");
const jsDiff = require("diff");
let diffToolAvailable = null;
function isDiffToolAvailable() {
    if (diffToolAvailable == null) {
        diffToolAvailable = pathUtil_1.getExecutableFileUnderPath('diff') != null;
    }
    return diffToolAvailable;
}
exports.isDiffToolAvailable = isDiffToolAvailable;
var EditTypes;
(function (EditTypes) {
    EditTypes[EditTypes["EDIT_DELETE"] = 0] = "EDIT_DELETE";
    EditTypes[EditTypes["EDIT_INSERT"] = 1] = "EDIT_INSERT";
    EditTypes[EditTypes["EDIT_REPLACE"] = 2] = "EDIT_REPLACE";
})(EditTypes = exports.EditTypes || (exports.EditTypes = {}));
;
class Edit {
    constructor(action, start) {
        this.action = action;
        this.start = start;
        this.text = '';
    }
    // Creates TextEdit for current Edit
    apply() {
        switch (this.action) {
            case EditTypes.EDIT_INSERT:
                return vscode_1.TextEdit.insert(this.start, this.text);
            case EditTypes.EDIT_DELETE:
                return vscode_1.TextEdit.delete(new vscode_1.Range(this.start, this.end));
            case EditTypes.EDIT_REPLACE:
                return vscode_1.TextEdit.replace(new vscode_1.Range(this.start, this.end), this.text);
        }
    }
    // Applies Edit using given TextEditorEdit
    applyUsingTextEditorEdit(editBuilder) {
        switch (this.action) {
            case EditTypes.EDIT_INSERT:
                editBuilder.insert(this.start, this.text);
                break;
            case EditTypes.EDIT_DELETE:
                editBuilder.delete(new vscode_1.Range(this.start, this.end));
                break;
            case EditTypes.EDIT_REPLACE:
                editBuilder.replace(new vscode_1.Range(this.start, this.end), this.text);
                break;
        }
    }
    // Applies Edits to given WorkspaceEdit
    applyUsingWorkspaceEdit(workspaceEdit, fileUri) {
        switch (this.action) {
            case EditTypes.EDIT_INSERT:
                workspaceEdit.insert(fileUri, this.start, this.text);
                break;
            case EditTypes.EDIT_DELETE:
                workspaceEdit.delete(fileUri, new vscode_1.Range(this.start, this.end));
                break;
            case EditTypes.EDIT_REPLACE:
                workspaceEdit.replace(fileUri, new vscode_1.Range(this.start, this.end), this.text);
                break;
        }
    }
}
exports.Edit = Edit;
/**
 * Uses diff module to parse given array of IUniDiff objects and returns edits for files
 *
 * @param diffOutput jsDiff.IUniDiff[]
 *
 * @returns Array of FilePatch objects, one for each file
 */
function parseUniDiffs(diffOutput) {
    let filePatches = [];
    diffOutput.forEach((uniDiff) => {
        let edit = null;
        let edits = [];
        uniDiff.hunks.forEach((hunk) => {
            let startLine = hunk.oldStart;
            hunk.lines.forEach((line) => {
                switch (line.substr(0, 1)) {
                    case '-':
                        if (edit == null) {
                            edit = new Edit(EditTypes.EDIT_DELETE, new vscode_1.Position(startLine - 1, 0));
                        }
                        edit.end = new vscode_1.Position(startLine, 0);
                        startLine++;
                        break;
                    case '+':
                        if (edit == null) {
                            edit = new Edit(EditTypes.EDIT_INSERT, new vscode_1.Position(startLine - 1, 0));
                        }
                        else if (edit.action === EditTypes.EDIT_DELETE) {
                            edit.action = EditTypes.EDIT_REPLACE;
                        }
                        edit.text += line.substr(1) + '\n';
                        break;
                    case ' ':
                        startLine++;
                        if (edit != null) {
                            edits.push(edit);
                        }
                        edit = null;
                        break;
                }
            });
            if (edit != null) {
                edits.push(edit);
            }
        });
        filePatches.push({ fileName: uniDiff.oldFileName, edits: edits });
    });
    return filePatches;
}
'use strict';
/**
 * Returns a FilePatch object by generating diffs between given oldStr and newStr using the diff module
 *
 * @param fileName string: Name of the file to which edits should be applied
 * @param oldStr string
 * @param newStr string
 *
 * @returns A single FilePatch object
 */
function getEdits(fileName, oldStr, newStr) {
    if (process.platform === 'win32') {
        oldStr = oldStr.split('\r\n').join('\n');
        newStr = newStr.split('\r\n').join('\n');
    }
    let unifiedDiffs = jsDiff.structuredPatch(fileName, fileName, oldStr, newStr, '', '');
    let filePatches = parseUniDiffs([unifiedDiffs]);
    return filePatches[0];
}
exports.getEdits = getEdits;
/**
 * Uses diff module to parse given diff string and returns edits for files
 *
 * @param diffStr : Diff string in unified format. http://www.gnu.org/software/diffutils/manual/diffutils.html#Unified-Format
 *
 * @returns Array of FilePatch objects, one for each file
 */
function getEditsFromUnifiedDiffStr(diffstr) {
    // Workaround for the bug https://github.com/kpdecker/jsdiff/issues/135 
    if (diffstr.startsWith('---')) {
        diffstr = diffstr.split('---').join('Index\n---');
    }
    let unifiedDiffs = jsDiff.parsePatch(diffstr);
    let filePatches = parseUniDiffs(unifiedDiffs);
    return filePatches;
}
exports.getEditsFromUnifiedDiffStr = getEditsFromUnifiedDiffStr;
//# sourceMappingURL=diffUtils.js.map