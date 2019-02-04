"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fs_1 = require("./../../helpers/fs");
const settings_1 = require("./../../helpers/settings");
const vscode_1 = require("./../../helpers/vscode");
const files_1 = require("./../../consts/files");
const getIconDefinition = (definitions, iconName) => {
    return definitions[iconName];
};
/**
 * Replaces icon path with the accented one.
 */
const replaceIconPathWithAccent = (iconPath, accentName) => {
    return iconPath.replace('.svg', `.accent.${accentName}.svg`);
};
/**
 * Fix icons when flag auto-fix is active and current theme is Material
 */
exports.default = () => __awaiter(this, void 0, void 0, function* () {
    const deferred = {};
    const promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    // Current theme id set on VSCode ("label" of the package.json)
    const themeLabel = vscode_1.getCurrentThemeID();
    // If this method was called without Material Theme set, just return
    if (!settings_1.isMaterialTheme(themeLabel)) {
        return deferred.resolve();
    }
    const DEFAULTS = fs_1.getDefaultValues();
    const CUSTOM_SETTINGS = settings_1.getCustomSettings();
    const materialIconVariantID = fs_1.getIconVariantFromTheme(themeLabel);
    const currentThemeIconsID = vscode_1.getCurrentThemeIconsID();
    const newThemeIconsID = materialIconVariantID ?
        `eq-material-theme-icons-${materialIconVariantID}` : 'eq-material-theme-icons';
    // Just set the correct Material Theme icons variant if wasn't
    // Or also change the current icons set to the Material Theme icons variant
    // (this is intended: this command was called directly or `autoFix` flag was already checked by other code)
    if (currentThemeIconsID !== newThemeIconsID) {
        yield vscode_1.setIconsID(newThemeIconsID);
    }
    // package.json iconThemes object for the current icons set
    const themeIconsContribute = fs_1.getThemeIconsContribute(newThemeIconsID);
    // Actual json file of the icons theme (eg. Material-Theme-Icons-Darker.json)
    const theme = fs_1.getThemeIconsByContributeID(newThemeIconsID);
    const newIconPath = (outIcon) => settings_1.isAccent(CUSTOM_SETTINGS.accent, DEFAULTS) ?
        replaceIconPathWithAccent(outIcon.iconPath, CUSTOM_SETTINGS.accent.replace(/\s+/, '-')) : outIcon.iconPath;
    fs_1.getAccentableIcons().forEach(iconName => {
        const distIcon = getIconDefinition(theme.iconDefinitions, iconName);
        const outIcon = getIconDefinition(DEFAULTS.icons.theme.iconDefinitions, iconName);
        if (typeof distIcon === 'object' && typeof outIcon === 'object') {
            distIcon.iconPath = newIconPath(outIcon);
        }
    });
    // Path of the icons theme .json
    const themePath = fs_1.getAbsolutePath(themeIconsContribute.path);
    fs.writeFile(themePath, JSON.stringify(theme), {
        encoding: files_1.CHARSET
    }, (err) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve();
    }));
    return promise
        .then(() => vscode_1.reloadWindow())
        .catch((error) => console.trace(error));
});
//# sourceMappingURL=index.js.map