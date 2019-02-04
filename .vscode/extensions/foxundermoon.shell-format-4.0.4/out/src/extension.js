"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shFormat_1 = require("./shFormat");
var DocumentFilterScheme;
(function (DocumentFilterScheme) {
    DocumentFilterScheme["File"] = "file";
    DocumentFilterScheme["Untitled"] = "untitled";
})(DocumentFilterScheme = exports.DocumentFilterScheme || (exports.DocumentFilterScheme = {}));
const formatOnSaveConfig = "editor.formatOnSave";
const formatDocumentCommand = "editor.action.formatDocument";
function activate(context) {
    const settings = vscode.workspace.getConfiguration(shFormat_1.configurationPrefix);
    const shfmter = new shFormat_1.Formatter();
    const shFmtProvider = new shFormat_1.ShellDocumentFormattingEditProvider(shfmter, settings);
    shFormat_1.checkEnv();
    const effectLanguages = settings.get(shFormat_1.ConfigItemName.EffectLanguages);
    if (effectLanguages) {
        for (const lang of effectLanguages) {
            for (const schemae of Object.values(DocumentFilterScheme)) {
                context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider({ language: lang, scheme: schemae /*pattern: '*.sh'*/ }, shFmtProvider));
            }
        }
    }
    const formatOnSave = vscode.workspace
        .getConfiguration()
        .get(formatOnSaveConfig);
    if (formatOnSave) {
        vscode.workspace.onWillSaveTextDocument((event) => {
            // Only on explicit save
            if (event.reason === 1 && isAllowedTextDocument(event.document)) {
                vscode.commands.executeCommand(formatDocumentCommand);
            }
        });
    }
}
exports.activate = activate;
function isAllowedTextDocument(textDocument) {
    const settings = vscode.workspace.getConfiguration(shFormat_1.configurationPrefix);
    const effectLanguages = settings.get(shFormat_1.ConfigItemName.EffectLanguages);
    const { scheme } = textDocument.uri;
    if (effectLanguages) {
        const checked = effectLanguages.find(e => e === textDocument.languageId);
        if (checked) {
            return (scheme === DocumentFilterScheme.File ||
                scheme === DocumentFilterScheme.Untitled);
        }
    }
    return false;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map