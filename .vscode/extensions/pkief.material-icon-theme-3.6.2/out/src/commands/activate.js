"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers = require("./../helpers");
const versioning = require("./../helpers/versioning");
const i18n = require("./../i18n");
const outdatedMessage = require("./../messages/outdated");
/** Activate the icon theme by changing the settings for the iconTheme. */
exports.activateIconTheme = () => {
    if (!versioning.checkVersionSupport('1.10.0')) {
        outdatedMessage.showOutdatedMessage();
        return Promise.reject('Outdated version of vscode!');
    }
    return setIconTheme();
};
/** Set the icon theme in the config. */
const setIconTheme = () => {
    // global user config
    return helpers.getConfig().update('workbench.iconTheme', 'material-icon-theme', true)
        .then(() => {
        // local workspace config
        if (helpers.getConfig().inspect('workbench.iconTheme').workspaceValue !== undefined) {
            helpers.getConfig().update('workbench.iconTheme', 'material-icon-theme');
        }
        vscode.window.showInformationMessage(i18n.translate('activated'));
    });
};
//# sourceMappingURL=activate.js.map