"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const icons_1 = require("../icons");
const helpers = require("./../helpers");
const i18n = require("./../i18n");
/** Command to toggle the folder icons. */
exports.changeOpacity = () => {
    return exports.getCurrentOpacityValue()
        .then(showInput)
        .catch(err => console.log(err));
};
/** Show input to enter the opacity value. */
const showInput = (opacity) => {
    vscode.window.showInputBox({
        placeHolder: i18n.translate('opacity.inputPlaceholder'),
        ignoreFocusOut: true,
        value: String(opacity),
        validateInput: validateOpacityInput
    }).then(value => setOpacityConfig(+value));
};
/** Validate the opacity value which was inserted by the user. */
const validateOpacityInput = (opacityInput) => {
    if (!icons_1.validateOpacityValue(+opacityInput)) {
        return i18n.translate('opacity.wrongValue');
    }
    return undefined;
};
/** Get the current value of the opacity of the icons. */
exports.getCurrentOpacityValue = () => {
    const defaultOptions = icons_1.getDefaultIconOptions();
    return helpers.getMaterialIconsJSON().then((config) => config.options.opacity === undefined ?
        defaultOptions.opacity : config.options.opacity);
};
const setOpacityConfig = (opacity) => {
    if (opacity !== undefined) {
        helpers.setThemeConfig('opacity', opacity, true);
    }
};
//# sourceMappingURL=opacity.js.map