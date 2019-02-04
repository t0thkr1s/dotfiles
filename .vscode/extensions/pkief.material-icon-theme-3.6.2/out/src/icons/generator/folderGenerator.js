"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const merge = require("lodash.merge");
const path = require("path");
const constants_1 = require("./constants");
/**
 * Get the folder icon definitions as object.
 */
exports.getFolderIconDefinitions = (folderThemes, config, options) => {
    config = merge({}, config);
    config.hidesExplorerArrows = options.hidesExplorerArrows;
    const activeTheme = getEnabledFolderTheme(folderThemes, options.folders.theme);
    const enabledIcons = disableIconsByPack(activeTheme, options.activeIconPack);
    const customIcons = getCustomIcons(options.folders.associations);
    const allIcons = [...enabledIcons, ...customIcons];
    if (options.folders.theme === 'none') {
        return config;
    }
    allIcons.forEach(icon => {
        if (icon.disabled)
            return;
        config = setIconDefinitions(config, icon);
        config = merge({}, config, setFolderNames(icon.name, icon.folderNames));
        config.light = icon.light ? merge({}, config.light, setFolderNames(icon.name, icon.folderNames, constants_1.lightVersion)) : config.light;
        config.highContrast = icon.highContrast ? merge({}, config.highContrast, setFolderNames(icon.name, icon.folderNames, constants_1.highContrastVersion)) : config.highContrast;
    });
    config = setDefaultFolderIcons(activeTheme, config);
    return config;
};
/**
 * Set the default folder icons for the theme.
 */
const setDefaultFolderIcons = (theme, config) => {
    config = merge({}, config);
    const hasFolderIcons = theme.defaultIcon.name && theme.defaultIcon.name.length > 0;
    if (hasFolderIcons) {
        config = setIconDefinitions(config, theme.defaultIcon);
    }
    config = merge({}, config, createDefaultIconConfigObject(hasFolderIcons, theme, ''));
    config.light = theme.defaultIcon.light ? merge({}, config.light, createDefaultIconConfigObject(hasFolderIcons, theme, constants_1.lightVersion)) : config.light;
    config.highContrast = theme.defaultIcon.highContrast ? merge({}, config.highContrast, createDefaultIconConfigObject(hasFolderIcons, theme, constants_1.highContrastVersion)) : config.highContrast;
    config = merge({}, config, createRootIconConfigObject(hasFolderIcons, theme, ''));
    if (theme.rootFolder) {
        config = setIconDefinitions(config, theme.rootFolder);
        config.light = theme.rootFolder.light ? merge({}, config.light, createRootIconConfigObject(hasFolderIcons, theme, constants_1.lightVersion)) : config.light;
        config.highContrast = theme.rootFolder.highContrast ? merge({}, config.highContrast, createRootIconConfigObject(hasFolderIcons, theme, constants_1.highContrastVersion)) : config.highContrast;
    }
    return config;
};
/**
 * Get the object of the current enabled theme.
 */
const getEnabledFolderTheme = (themes, enabledTheme) => {
    return themes.find(theme => theme.name === enabledTheme);
};
/**
 * Disable all file icons that are in a pack which is disabled.
 */
const disableIconsByPack = (folderIcons, activatedIconPack) => {
    if (!folderIcons.icons || folderIcons.icons.length === 0) {
        return [];
    }
    return folderIcons.icons.filter(icon => {
        return !icon.enabledFor ? true : icon.enabledFor.some(p => p === activatedIconPack);
    });
};
const setIconDefinitions = (config, icon) => {
    config = merge({}, config);
    config = createIconDefinitions(config, icon.name);
    if (icon.light) {
        config = merge({}, config, createIconDefinitions(config, icon.name, constants_1.lightVersion));
    }
    if (icon.highContrast) {
        config = merge({}, config, createIconDefinitions(config, icon.name, constants_1.highContrastVersion));
    }
    return config;
};
const createIconDefinitions = (config, iconName, appendix = '') => {
    config = merge({}, config);
    config.iconDefinitions[iconName + appendix] = {
        iconPath: `${constants_1.iconFolderPath}${iconName}${appendix}.svg`
    };
    config.iconDefinitions[`${iconName}${constants_1.openedFolder}${appendix}`] = {
        iconPath: `${constants_1.iconFolderPath}${iconName}${constants_1.openedFolder}${appendix}.svg`
    };
    return config;
};
const setFolderNames = (iconName, folderNames, appendix = '') => {
    const obj = { folderNames: {}, folderNamesExpanded: {} };
    folderNames.forEach(fn => {
        obj.folderNames[fn] = iconName + appendix;
        obj.folderNamesExpanded[fn] = `${iconName}${constants_1.openedFolder}${appendix}`;
    });
    return obj;
};
const createDefaultIconConfigObject = (hasFolderIcons, theme, appendix = '') => {
    const obj = {
        folder: '',
        folderExpanded: ''
    };
    obj.folder = hasFolderIcons ? theme.defaultIcon.name + appendix : '';
    obj.folderExpanded = hasFolderIcons ? `${theme.defaultIcon.name}${constants_1.openedFolder}${appendix}` : '';
    return obj;
};
const createRootIconConfigObject = (hasFolderIcons, theme, appendix = '') => {
    const obj = {
        rootFolder: '',
        rootFolderExpanded: ''
    };
    obj.rootFolder = hasFolderIcons ? theme.rootFolder ? theme.rootFolder.name + appendix : theme.defaultIcon.name + appendix : '';
    obj.rootFolderExpanded = hasFolderIcons ? theme.rootFolder ? `${theme.rootFolder.name}${constants_1.openedFolder}${appendix}` : `${theme.defaultIcon.name}${constants_1.openedFolder}${appendix}` : '';
    return obj;
};
const getCustomIcons = (folderAssociations) => {
    if (!folderAssociations)
        return [];
    const icons = Object.keys(folderAssociations).map(fa => ({
        // use default folder if icon name is empty
        name: folderAssociations[fa].length > 0 ? 'folder-' + folderAssociations[fa].toLowerCase() : 'folder',
        folderNames: [fa.toLowerCase()]
    }));
    return icons;
};
exports.generateFolderIcons = (color) => {
    if (!exports.validateHEXColorCode(color)) {
        return console.error('Invalid color code for folder icons');
    }
    const folderIcon = `M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z`;
    const folderIconOpen = `M19 20H4c-1.11 0-2-.9-2-2V6c0-1.11.89-2 2-2h6l2 2h7a2 2 0 0 1 2 2H4v10l2.14-8h17.07l-2.28 8.5c-.23.87-1.01 1.5-1.93 1.5z`;
    const rootFolderIcon = `M12 20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 5a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z`;
    const rootFolderIconOpen = `M12 20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z`;
    return writeSVGFiles('folder', getSVG(getPath(folderIcon, color)))
        .then(() => writeSVGFiles('folder-open', getSVG(getPath(folderIconOpen, color))))
        .then(() => writeSVGFiles('folder-root', getSVG(getPath(rootFolderIcon, color))))
        .then(() => writeSVGFiles('folder-root-open', getSVG(getPath(rootFolderIconOpen, color))))
        .catch(e => console.log(e));
};
const getPath = (d, color) => `<path d="${d}" fill="${color}" />`;
const getSVG = (path) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;
const writeSVGFiles = (iconName, svg) => {
    return new Promise((resolve, reject) => {
        let iconPath = path.join(__dirname, '..', '..', '..');
        const parentFolder = iconPath.split(path.sep).pop();
        if (parentFolder === 'out') {
            iconPath = path.join(iconPath, '..');
        }
        const iconsFolderPath = path.join(iconPath, 'icons', `${iconName}.svg`);
        try {
            fs.writeFileSync(iconsFolderPath, svg);
            resolve();
        }
        catch (e) {
            console.log(e);
            reject(e);
        }
        resolve();
    });
};
/**
 * Validate the HEX color code
 * @param color HEX code
 */
exports.validateHEXColorCode = (color) => {
    const hexPattern = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    return color.length > 0 && hexPattern.test(color);
};
//# sourceMappingURL=folderGenerator.js.map