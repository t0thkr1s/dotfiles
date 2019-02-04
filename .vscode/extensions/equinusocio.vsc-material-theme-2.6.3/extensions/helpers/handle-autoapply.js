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
const settings_1 = require("./settings");
const messages_1 = require("./messages");
const commands_1 = require("../commands");
let fixIconsRunning = false;
exports.default = (doubleCheck) => __awaiter(this, void 0, void 0, function* () {
    if (!doubleCheck || fixIconsRunning) {
        return;
    }
    if (settings_1.isAutoApplyEnable()) {
        fixIconsRunning = true;
        return commands_1.fixIcons().then(() => fixIconsRunning = false);
    }
    if (!settings_1.isReloadNotificationEnable()) {
        return;
    }
    const result = yield messages_1.infoMessage();
    if (result.reload) {
        fixIconsRunning = true;
        return commands_1.fixIcons().then(() => fixIconsRunning = false);
    }
});
//# sourceMappingURL=handle-autoapply.js.map