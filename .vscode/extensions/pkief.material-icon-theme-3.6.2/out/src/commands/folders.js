"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const icons_1 = require("../icons");
const helpers = require("./../helpers");
const i18n = require("./../i18n");
/** Command to toggle the folder icons. */
exports.changeFolderTheme = () => {
    return exports.checkFolderIconsStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions)
        .catch(err => console.log(err));
};
/** Show QuickPick items to select prefered configuration for the folder icons. */
const showQuickPickItems = (activeTheme) => {
    const options = icons_1.folderIcons.map((theme) => ({
        description: helpers.capitalizeFirstLetter(theme.name),
        detail: theme.name === 'none' ? i18n.translate('folders.disabled') : i18n.translate('folders.theme.description', helpers.capitalizeFirstLetter(theme.name)),
        label: theme.name === activeTheme ? '\u2714' : '\u25FB'
    }));
    return vscode.window.showQuickPick(options, {
        placeHolder: i18n.translate('folders.toggleIcons'),
        ignoreFocusOut: false,
        matchOnDescription: true
    });
};
/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (value) => {
    if (!value || !value.description)
        return;
    return helpers.setThemeConfig('folders.theme', value.description.toLowerCase(), true);
};
/** Are the folder icons enabled? */
exports.checkFolderIconsStatus = () => {
    return helpers.getMaterialIconsJSON().then((config) => config.options.folders.theme);
};
//# sourceMappingURL=folders.js.map