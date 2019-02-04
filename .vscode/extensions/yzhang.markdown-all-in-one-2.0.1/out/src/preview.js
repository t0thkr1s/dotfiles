'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Modified from https://github.com/hnw/vscode-auto-open-markdown-preview
 */
const vscode_1 = require("vscode");
let currentDoc;
function activate(context) {
    vscode_1.window.onDidChangeActiveTextEditor(editor => {
        autoPreviewToSide(editor);
    });
    // Try preview when this extension is activated the first time
    autoPreviewToSide(vscode_1.window.activeTextEditor);
    // Override default preview keybindings (from 'open preview' to 'toggle preview' i.e. 'open/close preview')
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.togglePreview', () => {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
        }
        else if (editor.document.languageId === 'markdown') {
            vscode_1.commands.executeCommand('markdown.showPreview');
        }
    }), vscode_1.commands.registerCommand('markdown.extension.togglePreviewToSide', () => {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
        }
        else if (editor.document.languageId === 'markdown') {
            vscode_1.commands.executeCommand('markdown.showPreviewToSide');
        }
    }));
}
exports.activate = activate;
function autoPreviewToSide(editor) {
    if (!vscode_1.workspace.getConfiguration('markdown.extension.preview').get('autoShowPreviewToSide'))
        return;
    if (!editor || editor.document.languageId !== 'markdown')
        return;
    let doc = editor.document;
    if (doc != currentDoc) {
        vscode_1.commands.executeCommand('markdown.showPreviewToSide')
            .then(() => { vscode_1.commands.executeCommand('workbench.action.navigateBack'); });
        currentDoc = doc;
    }
}
//# sourceMappingURL=preview.js.map