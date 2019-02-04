"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const icons_1 = require("../icons");
const helpers = require("./../helpers");
const i18n = require("./../i18n");
const iconPalette = [
    { label: 'Grey (Default)', hex: '#90a4ae' },
    { label: 'Blue', hex: '#42a5f5' },
    { label: 'Green', hex: '#7CB342' },
    { label: 'Teal', hex: '#26A69A' },
    { label: 'Red', hex: '#EF5350' },
    { label: 'Orange', hex: '#FF7043' },
    { label: 'Yellow', hex: '#FDD835' },
    { label: 'Custom Color', hex: 'Custom HEX Code' },
];
/** Command to toggle the folder icons. */
exports.changeFolderColor = () => {
    return exports.checkFolderColorStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions)
        .catch(err => console.log(err));
};
/** Show QuickPick items to select prefered color for the folder icons. */
const showQuickPickItems = (currentColor) => {
    const options = iconPalette.map((color) => ({
        description: color.label,
        label: isColorActive(color, currentColor) ? '\u2714' : '\u25FB'
    }));
    return vscode.window.showQuickPick(options, {
        placeHolder: i18n.translate('folders.color'),
        ignoreFocusOut: false,
        matchOnDescription: true
    });
};
/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (value) => {
    if (!value || !value.description)
        return;
    if (value.description === 'Custom Color') {
        vscode.window.showInputBox({
            placeHolder: i18n.translate('folders.hexCode'),
            ignoreFocusOut: true,
            validateInput: validateColorInput
        }).then(value => setColorConfig(value));
    }
    else {
        const hexCode = iconPalette.find(c => c.label === value.description).hex;
        setColorConfig(hexCode);
    }
};
const validateColorInput = (colorInput) => {
    if (!icons_1.validateHEXColorCode(colorInput)) {
        return i18n.translate('folders.wrongHexCode');
    }
    return undefined;
};
/** Check status of the folder color */
exports.checkFolderColorStatus = () => {
    const defaultOptions = icons_1.getDefaultIconOptions();
    return helpers.getMaterialIconsJSON().then((config) => config.options.folders.color === undefined ?
        defaultOptions.folders.color : config.options.folders.color);
};
const setColorConfig = (value) => {
    if (value) {
        helpers.setThemeConfig('folders.color', value.toLowerCase(), true);
    }
};
const isColorActive = (color, currentColor) => {
    if (color.label === 'Custom Color') {
        return !iconPalette.some(c => c.hex.toLowerCase() === currentColor.toLowerCase());
    }
    return color.hex.toLowerCase() === currentColor.toLowerCase();
};
//# sourceMappingURL=folderColor.js.map