"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const versioning_1 = require("../helpers/versioning");
const update_1 = require("./update");
const welcome_1 = require("./welcome");
/** Initialization of the icons every time the theme get activated */
exports.showStartMessages = (themeStatus) => {
    return themeStatus.then((status) => {
        if (status === versioning_1.ThemeStatus.updated) {
            update_1.showUpdateMessage();
        }
        else if (status === versioning_1.ThemeStatus.neverUsedBefore) {
            welcome_1.showWelcomeMessage();
        }
    });
};
//# sourceMappingURL=start.js.map