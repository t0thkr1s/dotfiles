"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("./settings");
const vscode_1 = require("./vscode");
const handle_autoapply_1 = require("./handle-autoapply");
const commands_1 = require("../commands");
const onIconsChanged = () => {
    const currentIconsTheme = vscode_1.getCurrentThemeIconsID();
    return handle_autoapply_1.default(settings_1.isMaterialThemeIcons(currentIconsTheme));
};
const onThemeChanged = () => {
    const currentTheme = vscode_1.getCurrentThemeID();
    return handle_autoapply_1.default(settings_1.isMaterialTheme(currentTheme));
};
const onAccentChanged = () => {
    const currentTheme = vscode_1.getCurrentThemeID();
    const currentIconsTheme = vscode_1.getCurrentThemeIconsID();
    const currentAccent = settings_1.getAccent();
    return commands_1.accentsSetter(currentAccent)
        .then(() => handle_autoapply_1.default(settings_1.isMaterialTheme(currentTheme) && settings_1.isMaterialThemeIcons(currentIconsTheme)));
};
exports.onChangeConfiguration = (event) => {
    const isColorTheme = event.affectsConfiguration('workbench.colorTheme');
    const isIconTheme = event.affectsConfiguration('workbench.iconTheme');
    const isAccent = event.affectsConfiguration('materialTheme.accent');
    return isIconTheme ? onIconsChanged() :
        isColorTheme ? onThemeChanged() :
            isAccent ? onAccentChanged() : null;
};
//# sourceMappingURL=configuration-change.js.map