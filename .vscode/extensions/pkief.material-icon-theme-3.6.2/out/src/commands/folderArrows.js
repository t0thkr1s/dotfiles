"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers = require("./../helpers");
const versioning = require("./../helpers/versioning");
const i18n = require("./../i18n");
const outdatedMessage = require("./../messages/outdated");
/** Command to toggle the folder icons. */
exports.toggleFolderArrows = () => {
    if (!versioning.checkVersionSupport('1.18.0-insider')) {
        outdatedMessage.showOutdatedMessage();
        return Promise.reject('Outdated version of vscode!');
    }
    return exports.checkArrowStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions)
        .catch(err => console.log(err));
};
/** Show QuickPick items to select prefered configuration for the folder icons. */
const showQuickPickItems = (status) => {
    const on = {
        description: i18n.translate('toggleSwitch.on'),
        detail: i18n.translate(`hidesExplorerArrows.enableArrows`),
        label: !status ? '\u2714' : '\u25FB'
    };
    const off = {
        description: i18n.translate('toggleSwitch.off'),
        detail: i18n.translate(`hidesExplorerArrows.disableArrows`),
        label: status ? '\u2714' : '\u25FB'
    };
    return vscode.window.showQuickPick([on, off], {
        placeHolder: i18n.translate('hidesExplorerArrows.toggleArrows'),
        ignoreFocusOut: false,
        matchOnDescription: true
    });
};
/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (value) => {
    if (!value || !value.description)
        return;
    switch (value.description) {
        case i18n.translate('toggleSwitch.on'): {
            helpers.setThemeConfig('hidesExplorerArrows', false, true);
            break;
        }
        case i18n.translate('toggleSwitch.off'): {
            helpers.setThemeConfig('hidesExplorerArrows', true, true);
            break;
        }
        default:
            break;
    }
};
/** Are the arrows enabled? */
exports.checkArrowStatus = () => {
    return helpers.getMaterialIconsJSON().then((config) => config.hidesExplorerArrows);
};
//# sourceMappingURL=folderArrows.js.map