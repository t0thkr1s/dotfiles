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
const semver = require("semver");
const vscode = require("vscode");
const helpers = require("./index");
var ThemeStatus;
(function (ThemeStatus) {
    ThemeStatus[ThemeStatus["neverUsedBefore"] = 0] = "neverUsedBefore";
    ThemeStatus[ThemeStatus["updated"] = 1] = "updated";
    ThemeStatus[ThemeStatus["current"] = 2] = "current";
})(ThemeStatus = exports.ThemeStatus || (exports.ThemeStatus = {}));
/** Check the current status of the theme */
exports.checkThemeStatus = (state) => __awaiter(this, void 0, void 0, function* () {
    try {
        // get the version from the state
        const stateVersion = yield state.get('material-icon-theme.version');
        const packageVersion = getCurrentExtensionVersion();
        // check if the theme was used before
        if (stateVersion === undefined) {
            yield updateExtensionVersionInMemento(state);
            return themeIsAlreadyActivated() ? ThemeStatus.updated : ThemeStatus.neverUsedBefore;
        }
        // compare the version in the state with the package version
        else if (semver.lt(stateVersion, packageVersion)) {
            yield updateExtensionVersionInMemento(state);
            return ThemeStatus.updated;
        }
        else {
            return ThemeStatus.current;
        }
    }
    catch (err) {
        console.log(err);
    }
});
/** Check if the theme was used before */
const themeIsAlreadyActivated = () => {
    return helpers.isThemeActivated() || helpers.isThemeActivated(true);
};
/** Update the version number to the current version in the memento. */
const updateExtensionVersionInMemento = (state) => __awaiter(this, void 0, void 0, function* () {
    return yield state.update('material-icon-theme.version', getCurrentExtensionVersion());
});
/** Get the current version of the extension */
const getCurrentExtensionVersion = () => {
    return vscode.extensions.getExtension('PKief.material-icon-theme').packageJSON.version;
};
/**
 * Check if the current version of VS Code
 * supports new features.
*/
exports.checkVersionSupport = (supportedVersion) => {
    return !semver.lt(vscode.version, supportedVersion);
};
//# sourceMappingURL=versioning.js.map