"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function askForWindowReload() {
    const PROMPT_MESSAGE = 'Material Theme requires VS Code reload in order to display icons correctly.';
    const PROMPT_MESSAGE_CONFIRM = 'Ok, reload';
    const PROMPT_MESSAGE_CANCEL = 'I will do it later';
    return vscode.window.showInformationMessage(PROMPT_MESSAGE, PROMPT_MESSAGE_CONFIRM, PROMPT_MESSAGE_CANCEL)
        .then(response => {
        if (response === PROMPT_MESSAGE_CONFIRM) {
            reloadWindow();
        }
    }, err => {
        console.log(err);
    });
}
exports.askForWindowReload = askForWindowReload;
/**
 * Gets your current theme ID
 */
function getCurrentThemeID() {
    return vscode.workspace.getConfiguration().get('workbench.colorTheme');
}
exports.getCurrentThemeID = getCurrentThemeID;
/**
 * Gets your current icons theme ID
 */
function getCurrentThemeIconsID() {
    return vscode.workspace.getConfiguration().get('workbench.iconTheme');
}
exports.getCurrentThemeIconsID = getCurrentThemeIconsID;
/**
 * Set a specific id for icons
 */
function setIconsID(id) {
    return vscode.workspace.getConfiguration().update('workbench.iconTheme', id, true);
}
exports.setIconsID = setIconsID;
/**
 * Reloads current vscode window.
 */
function reloadWindow() {
    vscode.commands.executeCommand('workbench.action.reloadWindow');
}
exports.reloadWindow = reloadWindow;
//# sourceMappingURL=vscode.js.map