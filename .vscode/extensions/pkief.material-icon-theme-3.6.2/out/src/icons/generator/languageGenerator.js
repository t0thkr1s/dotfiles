"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("lodash.merge");
const constants_1 = require("./constants");
/**
 * Get all file icons that can be used in this theme.
 */
exports.getLanguageIconDefinitions = (languages, config, options) => {
    config = merge({}, config);
    const enabledLanguages = disableLanguagesByPack(languages, options.activeIconPack);
    const customIcons = getCustomIcons(options.languages.associations);
    const allLanguageIcons = [...enabledLanguages, ...customIcons];
    allLanguageIcons.forEach(lang => {
        if (lang.disabled)
            return;
        config = setIconDefinitions(config, lang.icon);
        config = merge({}, config, setLanguageIdentifiers(lang.icon.name, lang.ids));
        config.light = lang.icon.light ? merge({}, config.light, setLanguageIdentifiers(lang.icon.name + constants_1.lightVersion, lang.ids)) : config.light;
        config.highContrast = lang.icon.highContrast ? merge({}, config.highContrast, setLanguageIdentifiers(lang.icon.name + constants_1.highContrastVersion, lang.ids)) : config.highContrast;
    });
    return config;
};
const setIconDefinitions = (config, icon) => {
    config = merge({}, config);
    config = createIconDefinitions(config, icon.name);
    config = merge({}, config, icon.light ? createIconDefinitions(config, icon.name + constants_1.lightVersion) : config.light);
    config = merge({}, config, icon.highContrast ? createIconDefinitions(config, icon.name + constants_1.highContrastVersion) : config.highContrast);
    return config;
};
const createIconDefinitions = (config, iconName) => {
    config = merge({}, config);
    config.iconDefinitions[iconName] = {
        iconPath: `${constants_1.iconFolderPath}${iconName}.svg`
    };
    return config;
};
const setLanguageIdentifiers = (iconName, languageIds) => {
    const obj = { languageIds: {} };
    languageIds.forEach(id => {
        obj.languageIds[id] = iconName;
    });
    return obj;
};
const getCustomIcons = (languageAssocitations) => {
    if (!languageAssocitations)
        return [];
    const icons = Object.keys(languageAssocitations).map(fa => ({
        icon: { name: languageAssocitations[fa].toLowerCase() },
        ids: [fa.toLowerCase()]
    }));
    return icons;
};
/**
 * Disable all file icons that are in a pack which is disabled.
 */
const disableLanguagesByPack = (languageIcons, activatedIconPack) => {
    return languageIcons.filter(language => {
        return !language.enabledFor ? true : language.enabledFor.some(p => p === activatedIconPack);
    });
};
//# sourceMappingURL=languageGenerator.js.map