"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const index_1 = require("../icons/index");
const reloadMessages = require("./../messages/reload");
/** Get configuration of vs code. */
exports.getConfig = (section) => {
    return vscode.workspace.getConfiguration(section);
};
/** Get list of configuration entries of package.json */
exports.getListOfConfigs = () => {
    return vscode.extensions.getExtension('PKief.material-icon-theme').packageJSON.contributes.configuration.properties;
};
/** Update configuration of vs code. */
exports.setConfig = (section, value, global = false) => {
    return exports.getConfig().update(section, value, global);
};
exports.getThemeConfig = (section) => {
    return exports.getConfig('material-icon-theme').inspect(section);
};
/** Is a folder opened? */
exports.hasWorkspace = () => {
    return vscode.workspace.rootPath !== undefined;
};
/** Set the config of the theme. */
exports.setThemeConfig = (section, value, global = false) => {
    return exports.getConfig('material-icon-theme').update(section, value, global);
};
/**
 * Is the theme already activated in the editor configuration?
 * @param{boolean} global false by default
 */
exports.isThemeActivated = (global = false) => {
    return global ? exports.getConfig().inspect('workbench.iconTheme').globalValue === 'material-icon-theme'
        : exports.getConfig().inspect('workbench.iconTheme').workspaceValue === 'material-icon-theme';
};
/** Is the theme not visible for the user? */
exports.isThemeNotVisible = () => {
    const config = exports.getConfig().inspect('workbench.iconTheme');
    return (!exports.isThemeActivated(true) && config.workspaceValue === undefined) || // no workspace and not global
        (!exports.isThemeActivated() && config.workspaceValue !== undefined);
};
/** Return the path of the extension in the file system. */
exports.getExtensionPath = () => path.join(__dirname, '..', '..', '..');
/** Get the configuration of the icons as JSON Object */
exports.getMaterialIconsJSON = () => {
    return new Promise((resolve, reject) => {
        const iconJSONPath = path.join(exports.getExtensionPath(), 'out', 'src', index_1.iconJsonName);
        fs.readFile(iconJSONPath, 'utf8', (err, data) => {
            if (data) {
                resolve(JSON.parse(data));
            }
            else {
                reject(err);
            }
        });
    });
};
/** Reload vs code window */
exports.promptToReload = () => {
    return reloadMessages.showConfirmToReloadMessage().then(result => {
        if (result)
            reloadWindow();
    });
};
const reloadWindow = () => {
    return vscode.commands.executeCommand('workbench.action.reloadWindow');
};
/** Capitalize the first letter of a string */
exports.capitalizeFirstLetter = (name) => name.charAt(0).toUpperCase() + name.slice(1);
/** TitleCase all words in a string */
exports.toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};
//# sourceMappingURL=index.js.map