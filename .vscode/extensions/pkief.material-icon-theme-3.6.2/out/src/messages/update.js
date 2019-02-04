"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode = require("vscode");
const activate_1 = require("../commands/activate");
const helpers = require("./../helpers");
const versioning = require("./../helpers/versioning");
const i18n = require("./../i18n");
/** Show the update message if the icon theme has been updated. */
exports.showUpdateMessage = () => {
    // if the user does not want to see the update message
    if (helpers.getThemeConfig('showUpdateMessage').globalValue !== true)
        return;
    vscode.window.showInformationMessage(i18n.translate('themeUpdated'), 
    // show 'Activate' button if icon theme is not active
    (versioning.checkVersionSupport('1.10.0') && helpers.isThemeNotVisible())
        ? i18n.translate('activate') : undefined, i18n.translate('readChangelog'), i18n.translate('neverShowAgain')).then(handleUpdateMessageActions);
};
/** Handle the actions of the update message. */
const handleUpdateMessageActions = (value) => {
    switch (value) {
        case i18n.translate('activate'):
            activate_1.activateIconTheme();
            break;
        case i18n.translate('readChangelog'):
            opn('https://marketplace.visualstudio.com/items/PKief.material-icon-theme/changelog');
            break;
        case i18n.translate('neverShowAgain'):
            disableUpdateMessage();
            break;
        default:
            break;
    }
};
/** Disable the update messages in the global settings */
const disableUpdateMessage = () => {
    helpers.setThemeConfig('showUpdateMessage', false, true);
};
//# sourceMappingURL=update.js.map