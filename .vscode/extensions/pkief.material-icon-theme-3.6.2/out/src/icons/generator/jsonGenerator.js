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
const merge = require("lodash.merge");
const path = require("path");
const index_1 = require("../../models/index");
const fileIcons_1 = require("../fileIcons");
const folderIcons_1 = require("../folderIcons");
const languageIcons_1 = require("../languageIcons");
const constants_1 = require("./constants");
const index_2 = require("./index");
/**
 * Generate the complete icon configuration object that can be written as JSON file.
 */
exports.generateIconConfigurationObject = (options) => {
    const iconConfig = merge({}, new index_1.IconConfiguration(), { options });
    const languageIconDefinitions = index_2.getLanguageIconDefinitions(languageIcons_1.languageIcons, iconConfig, options);
    const fileIconDefinitions = index_2.getFileIconDefinitions(fileIcons_1.fileIcons, iconConfig, options);
    const folderIconDefinitions = index_2.getFolderIconDefinitions(folderIcons_1.folderIcons, iconConfig, options);
    return merge({}, languageIconDefinitions, fileIconDefinitions, folderIconDefinitions);
};
/**
 * Create the JSON file that is responsible for the icons in the editor.
 * @param updatedConfigs Options that have been changed.
 * @param updatedJSONConfig New JSON options that already include the updatedConfigs.
 */
exports.createIconFile = (updatedConfigs, updatedJSONConfig = {}) => __awaiter(this, void 0, void 0, function* () {
    // override the default options with the new options
    const options = merge({}, exports.getDefaultIconOptions(), updatedJSONConfig);
    const iconJSONPath = path.join(__dirname, '../../../', 'src', constants_1.iconJsonName);
    const json = exports.generateIconConfigurationObject(options);
    // make sure that the opacity value must be entered correctly to trigger a reload.
    if (updatedConfigs && updatedConfigs.opacity !== undefined && !index_2.validateOpacityValue(updatedConfigs.opacity)) {
        return Promise.reject('Material Icons: Invalid opacity value!');
    }
    // make sure that the value for the folder color is entered correctly to trigger a reload.
    if (updatedConfigs && updatedConfigs.folders) {
        if (typeof updatedConfigs.folders.color !== 'undefined') {
            if (!index_2.validateHEXColorCode(updatedConfigs.folders.color)) {
                return Promise.reject('Material Icons: Invalid folder color value!');
            }
        }
    }
    try {
        yield fs.writeFile(iconJSONPath, JSON.stringify(json, undefined, 2), (err) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                throw Error(err.message);
            }
            // if updatedConfigs do not exist (because of initial setup)
            // or new config value was detected by the change detection
            if (!updatedConfigs || (updatedConfigs.folders || {}).color) {
                yield index_2.generateFolderIcons(options.folders.color);
                yield index_2.setIconOpacity(options.opacity, ['folder.svg', 'folder-open.svg', 'folder-root.svg', 'folder-root-open.svg']);
            }
            if (!updatedConfigs || updatedConfigs.opacity !== undefined) {
                yield index_2.setIconOpacity(options.opacity);
            }
        }));
    }
    catch (error) {
        throw Error(error);
    }
    return constants_1.iconJsonName;
});
/**
 * The options control the generator and decide which icons are disabled or not.
 */
exports.getDefaultIconOptions = () => ({
    folders: {
        theme: 'specific',
        color: '#90a4ae',
        associations: {},
    },
    activeIconPack: 'angular',
    hidesExplorerArrows: false,
    opacity: 1,
    files: { associations: {} },
    languages: { associations: {} },
});
//# sourceMappingURL=jsonGenerator.js.map