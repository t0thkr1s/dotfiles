"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers = require("./../helpers");
const i18n = require("./../i18n");
/** User has to confirm if he wants to reload the editor */
exports.showConfirmToReloadMessage = () => {
    return new Promise((resolve) => {
        // if the user does not want to see the reload message
        if (helpers.getThemeConfig('showReloadMessage').globalValue === false)
            return;
        vscode.window.showInformationMessage(i18n.translate('confirmReload'), i18n.translate('reload'), i18n.translate('neverShowAgain')).then(value => {
            switch (value) {
                case i18n.translate('reload'):
                    resolve(true);
                    break;
                case i18n.translate('neverShowAgain'):
                    disableReloadMessage();
                    resolve(false);
                    break;
                default:
                    resolve(false);
                    break;
            }
        });
    });
};
/** Disable the reload message in the global settings */
const disableReloadMessage = () => {
    helpers.setThemeConfig('showReloadMessage', false, true);
};
//# sourceMappingURL=reload.js.map