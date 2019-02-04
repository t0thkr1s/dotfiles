"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const files_1 = require("./../consts/files");
const paths_1 = require("../consts/paths");
function ensureDir(dirname) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}
exports.ensureDir = ensureDir;
function getDefaultValues() {
    const defaults = require(path.join(paths_1.PATHS.VSIX_DIR, './extensions/defaults.json'));
    if (defaults === undefined || defaults === null) {
        throw new Error('Cannot find defaults params');
    }
    return defaults;
}
exports.getDefaultValues = getDefaultValues;
function getAbsolutePath(input) {
    return path.join(paths_1.PATHS.VSIX_DIR, input);
}
exports.getAbsolutePath = getAbsolutePath;
function getAccentableIcons() {
    return getDefaultValues().accentableIcons;
}
exports.getAccentableIcons = getAccentableIcons;
function getVariantIcons() {
    return getDefaultValues().variantsIcons;
}
exports.getVariantIcons = getVariantIcons;
function getAccentsProperties() {
    return getDefaultValues().accentsProperties;
}
exports.getAccentsProperties = getAccentsProperties;
/**
 * Gets a theme content by a given contribute ID
 */
function getThemeIconsByContributeID(ID) {
    const contribute = getThemeIconsContribute(ID);
    return contribute !== null ? require(path.join(paths_1.PATHS.VSIX_DIR, contribute.path)) : null;
}
exports.getThemeIconsByContributeID = getThemeIconsByContributeID;
/**
 * Gets a theme by name
 */
function getThemeIconsContribute(ID) {
    const contributes = getPackageJSON().contributes.iconThemes.filter(contribute => contribute.id === ID);
    return contributes[0] !== undefined ? contributes[0] : null;
}
exports.getThemeIconsContribute = getThemeIconsContribute;
/**
 * Icon variant name from theme name
 */
function getIconVariantFromTheme(theme) {
    const { themeIconVariants } = getDefaultValues();
    const found = Object.keys(themeIconVariants).find(variant => theme.includes(variant));
    return found ? found.toLowerCase() : null;
}
exports.getIconVariantFromTheme = getIconVariantFromTheme;
/**
 * Gets package JSON
 */
function getPackageJSON() {
    return require(path.join(paths_1.PATHS.VSIX_DIR, './package.json'));
}
exports.getPackageJSON = getPackageJSON;
/**
 * Writes a file inside the vsix directory
 */
function writeFile(filename, filecontent) {
    const filePath = path.join(paths_1.PATHS.VSIX_DIR, filename);
    fs.writeFileSync(filePath, filecontent, { encoding: files_1.CHARSET });
}
exports.writeFile = writeFile;
//# sourceMappingURL=fs.js.map