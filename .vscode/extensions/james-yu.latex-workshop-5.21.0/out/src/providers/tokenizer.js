"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function tokenizer(document, position) {
    const startResult = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position)).match(/[\\{,\s](?=[^\\{,\s]*$)/);
    const endResult = document.getText(new vscode.Range(position, new vscode.Position(position.line, 65535))).match(/[{}\[\],\s]/);
    if (startResult === null || endResult === null ||
        startResult.index === undefined || endResult.index === undefined ||
        startResult.index < 0 || endResult.index < 0) {
        return undefined;
    }
    const startIndex = startResult[0] === '\\' ? startResult.index : startResult.index + 1;
    return document.getText(new vscode.Range(new vscode.Position(position.line, startIndex), new vscode.Position(position.line, position.character + endResult.index)));
}
exports.tokenizer = tokenizer;
function onAPackage(document, position, token) {
    const line = document.lineAt(position.line).text;
    const regex = new RegExp(`\\\\usepackage(?:\\[[^\\[\\]\\{\\}]*\\])?\\{[\\w,]*${token}[\\w,]*\\}`);
    if (line.match(regex)) {
        return true;
    }
    return false;
}
exports.onAPackage = onAPackage;
//# sourceMappingURL=tokenizer.js.map