"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const activate_1 = require("./activate");
const folderArrows_1 = require("./folderArrows");
const folderColor_1 = require("./folderColor");
const folders_1 = require("./folders");
const iconPacks_1 = require("./iconPacks");
const opacity_1 = require("./opacity");
const restoreConfig_1 = require("./restoreConfig");
// Activate theme
const activateThemeCommand = vscode.commands.registerCommand('material-icon-theme.activateIcons', () => {
    activate_1.activateIconTheme();
});
// Icon packs
const toggleIconPacksCommand = vscode.commands.registerCommand('material-icon-theme.toggleIconPacks', () => {
    iconPacks_1.toggleIconPacks();
});
// Folder themes
const changeFolderThemeCommand = vscode.commands.registerCommand('material-icon-theme.changeFolderTheme', () => {
    folders_1.changeFolderTheme();
});
// Folder color
const toggleFolderColorCommand = vscode.commands.registerCommand('material-icon-theme.changeFolderColor', () => {
    folderColor_1.changeFolderColor();
});
// Reset config
const restoreDefaultConfigCommand = vscode.commands.registerCommand('material-icon-theme.restoreDefaultConfig', () => {
    restoreConfig_1.restoreDefaultConfig();
});
// Toggle the arrows near the folder icons
const hidesExplorerArrowsCommand = vscode.commands.registerCommand('material-icon-theme.hidesExplorerArrows', () => {
    folderArrows_1.toggleFolderArrows();
});
// Change the opacity of the icons
const changeOpacityCommand = vscode.commands.registerCommand('material-icon-theme.opacity', () => {
    opacity_1.changeOpacity();
});
exports.commands = [
    activateThemeCommand,
    toggleIconPacksCommand,
    changeFolderThemeCommand,
    toggleFolderColorCommand,
    restoreDefaultConfigCommand,
    hidesExplorerArrowsCommand,
    changeOpacityCommand
];
//# sourceMappingURL=index.js.map