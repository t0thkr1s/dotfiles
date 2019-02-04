"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("lodash.merge");
const index_1 = require("../../models/index");
const constants_1 = require("./constants");
/**
 * Get all file icons that can be used in this theme.
 */
exports.getFileIconDefinitions = (fileIcons, config, options) => {
    config = merge({}, config);
    const enabledIcons = disableIconsByPack(fileIcons, options.activeIconPack);
    const customIcons = getCustomIcons(options.files.associations);
    const allFileIcons = [...enabledIcons, ...customIcons];
    allFileIcons.forEach(icon => {
        if (icon.disabled)
            return;
        config = merge({}, config, setIconDefinition(icon.name));
        if (icon.light) {
            config = merge({}, config, setIconDefinition(icon.name, constants_1.lightVersion));
        }
        if (icon.highContrast) {
            config = merge({}, config, setIconDefinition(icon.name, constants_1.highContrastVersion));
        }
        if (icon.fileExtensions) {
            config = merge({}, config, mapSpecificFileIcons(icon, "fileExtensions" /* FileExtensions */));
        }
        if (icon.fileNames) {
            config = merge({}, config, mapSpecificFileIcons(icon, "fileNames" /* FileNames */, options.files.associations));
        }
    });
    // set default file icon
    config = merge({}, config, setIconDefinition(fileIcons.defaultIcon.name));
    config.file = fileIcons.defaultIcon.name;
    if (fileIcons.defaultIcon.light) {
        config = merge({}, config, setIconDefinition(fileIcons.defaultIcon.name, constants_1.lightVersion));
        config.light.file = fileIcons.defaultIcon.name + constants_1.lightVersion;
    }
    if (fileIcons.defaultIcon.highContrast) {
        config = merge({}, config, setIconDefinition(fileIcons.defaultIcon.name, constants_1.highContrastVersion));
        config.highContrast.file = fileIcons.defaultIcon.name + constants_1.highContrastVersion;
    }
    return config;
};
/**
 * Map the file extensions and the filenames to the related icons.
 */
const mapSpecificFileIcons = (icon, mappingType, customFileAssociation = {}) => {
    const config = new index_1.IconConfiguration();
    icon[mappingType].forEach(name => {
        // if the custom file extension should also overwrite the file names
        const shouldOverwriteFileNames = Object.keys(customFileAssociation).some(key => {
            // overwrite is enabled if there are two asterisks in the wildcard
            if (!/^\*{2}\./.test(key))
                return false;
            const fileExtension = key.replace(constants_1.wildcardPattern, '.');
            // check if the file name contains the particular file extension
            // (e.g. extension ".md" in "Readme.md" -> then overwrite it with the *.md icon)
            return name.toLowerCase().indexOf(fileExtension.toLowerCase()) !== -1;
        });
        // if overwrite is enabled then do not continue to set the icons for file names containing the file extension
        if (shouldOverwriteFileNames)
            return;
        config[mappingType][name] = icon.name;
        if (icon.light) {
            config.light[mappingType][name] = `${icon.name}${constants_1.lightVersion}`;
        }
        if (icon.highContrast) {
            config.highContrast[mappingType][name] = `${icon.name}${constants_1.highContrastVersion}`;
        }
    });
    return config;
};
/**
 * Disable all file icons that are in a pack which is disabled.
 */
const disableIconsByPack = (fileIcons, activatedIconPack) => {
    return fileIcons.icons.filter(icon => {
        return !icon.enabledFor ? true : icon.enabledFor.some(p => p === activatedIconPack);
    });
};
const setIconDefinition = (iconName, appendix = '') => {
    const obj = { iconDefinitions: {} };
    obj.iconDefinitions[`${iconName}${appendix}`] = {
        iconPath: `${constants_1.iconFolderPath}${iconName}${appendix}.svg`
    };
    return obj;
};
const getCustomIcons = (fileAssociations) => {
    if (!fileAssociations)
        return [];
    const icons = Object.keys(fileAssociations).map(fa => {
        const icon = { name: fileAssociations[fa].toLowerCase() };
        if (constants_1.wildcardPattern.test(fa)) {
            icon.fileExtensions = [fa.toLowerCase().replace(constants_1.wildcardPattern, '')];
        }
        else {
            icon.fileNames = [fa.toLowerCase()];
        }
        return icon;
    });
    return icons;
};
//# sourceMappingURL=fileGenerator.js.map