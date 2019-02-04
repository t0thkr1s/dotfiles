"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path_1 = require("path");
const bundledPrettier = require('prettier');
function getConfig(uri) {
    return vscode_1.workspace.getConfiguration('prettier', uri);
}
exports.getConfig = getConfig;
function getParsersFromLanguageId(languageId, prettierInstance, path) {
    const language = getSupportLanguages(prettierInstance).find(lang => Array.isArray(lang.vscodeLanguageIds) &&
        lang.vscodeLanguageIds.includes(languageId) &&
        (lang.extensions.length > 0 ||
            (path != null &&
                lang.filenames != null &&
                lang.filenames.includes(path_1.basename(path)))));
    if (!language) {
        return [];
    }
    return language.parsers;
}
exports.getParsersFromLanguageId = getParsersFromLanguageId;
function allEnabledLanguages() {
    return getSupportLanguages().reduce((ids, language) => [...ids, ...(language.vscodeLanguageIds || [])], []);
}
exports.allEnabledLanguages = allEnabledLanguages;
function rangeSupportedLanguages() {
    return [
        'javascript',
        'javascriptreact',
        'typescript',
        'typescriptreact',
        'json',
        'graphql',
    ];
}
exports.rangeSupportedLanguages = rangeSupportedLanguages;
function getGroup(group) {
    return getSupportLanguages().filter(language => language.group === group);
}
exports.getGroup = getGroup;
function getSupportLanguages(prettierInstance = bundledPrettier) {
    return prettierInstance.getSupportInfo(prettierInstance.version).languages;
}
//# sourceMappingURL=utils.js.map