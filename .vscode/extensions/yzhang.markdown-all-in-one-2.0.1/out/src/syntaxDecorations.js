'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const util_1 = require("./util");
let decorTypes = {
    "baseColor": vscode_1.window.createTextEditorDecorationType({
        "dark": { "color": "#EEFFFF" },
        "light": { "color": "000000" }
    }),
    "gray": vscode_1.window.createTextEditorDecorationType({
        "rangeBehavior": 1,
        "dark": { "color": "#636363" },
        "light": { "color": "#CCC" }
    }),
    "lightBlue": vscode_1.window.createTextEditorDecorationType({
        "color": "#4080D0"
    }),
    "orange": vscode_1.window.createTextEditorDecorationType({
        "color": "#D2B640"
    }),
    "strikethrough": vscode_1.window.createTextEditorDecorationType({
        "rangeBehavior": 1,
        "textDecoration": "line-through"
    }),
    "codeSpan": vscode_1.window.createTextEditorDecorationType({
        "rangeBehavior": 1,
        "border": "1px solid #454D51",
        "borderRadius": "3px"
    })
};
let decors = {};
for (const decorTypeName in decorTypes) {
    if (decorTypes.hasOwnProperty(decorTypeName)) {
        decors[decorTypeName] = [];
    }
}
let regexDecorTypeMapping = {
    "(~~.+?~~)": ["strikethrough"],
    "(`[^`\\n]+?`)": ["codeSpan"]
};
let regexDecorTypeMappingPlainTheme = {
    // `code`
    "(`)([^`\\n]+?)(`)": ["gray", "baseColor", "gray"],
    // [alt](link)
    "(^|[^!])(\\[)([^\\]\\n]*(?!\\].*\\[)[^\\[\\n]*)(\\]\\(.+?\\))": ["", "gray", "lightBlue", "gray"],
    // ![alt](link)
    "(\\!\\[)([^\\]\\n]*(?!\\].*\\[)[^\\[\\n]*)(\\]\\(.+?\\))": ["gray", "orange", "gray"],
    // *italic*
    "(\\*)([^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s].*?[^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s])(\\*)": ["gray", "baseColor", "gray"],
    // _italic_
    "(_)([^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s].*?[^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s])(_)": ["gray", "baseColor", "gray"],
    // **bold**
    "(\\*\\*)([^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s].*?[^\\*\\`\\!\\@\\#\\%\\^\\&\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s])(\\*\\*)": ["gray", "baseColor", "gray"]
};
function activiate(context) {
    vscode_1.window.onDidChangeActiveTextEditor(updateDecorations);
    vscode_1.workspace.onDidChangeTextDocument(event => {
        let editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined && event.document === editor.document) {
            triggerUpdateDecorations(editor);
        }
    });
    var timeout = null;
    function triggerUpdateDecorations(editor) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => updateDecorations(editor), 200);
    }
    let editor = vscode_1.window.activeTextEditor;
    if (editor) {
        updateDecorations(editor);
    }
}
exports.activiate = activiate;
function updateDecorations(editor) {
    if (!vscode_1.workspace.getConfiguration('markdown.extension.syntax').get('decorations'))
        return;
    if (editor === undefined) {
        editor = vscode_1.window.activeTextEditor;
    }
    if (!util_1.isMdEditor(editor)) {
        return;
    }
    // Clean decorations
    for (const decorTypeName in decorTypes) {
        if (decorTypes.hasOwnProperty(decorTypeName)) {
            decors[decorTypeName] = [];
        }
    }
    editor.document.getText().split(/\r?\n/g).forEach((lineText, lineNum) => {
        let appliedMappings = vscode_1.workspace.getConfiguration('markdown.extension.syntax').get('plainTheme') ? Object.assign({}, regexDecorTypeMapping, regexDecorTypeMappingPlainTheme) :
            regexDecorTypeMapping;
        for (const reText in appliedMappings) {
            if (appliedMappings.hasOwnProperty(reText)) {
                const decorTypeNames = appliedMappings[reText];
                const regex = new RegExp(reText, 'g');
                let match;
                while ((match = regex.exec(lineText)) !== null) {
                    let startIndex = match.index;
                    for (let i = 0; i < decorTypeNames.length; i++) {
                        let range = new vscode_1.Range(lineNum, startIndex, lineNum, startIndex + match[i + 1].length);
                        startIndex += match[i + 1].length;
                        const decorTypeName = decorTypeNames[i];
                        if (decorTypeName.length === 0) {
                            continue;
                        }
                        decors[decorTypeNames[i]].push(range);
                    }
                }
            }
        }
    });
    for (const decorTypeName in decors) {
        if (decors.hasOwnProperty(decorTypeName)) {
            editor.setDecorations(decorTypes[decorTypeName], decors[decorTypeName]);
        }
    }
}
//# sourceMappingURL=syntaxDecorations.js.map