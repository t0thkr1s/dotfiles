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
const vscode_1 = require("vscode");
const MESSAGES = {
    INFO: {
        message: 'Do you want to reload to apply Material Theme Icons to enjoy the full experience?',
        options: { ok: 'Yeah, reload', cancel: 'No, thank you' }
    },
    CHANGELOG: {
        message: 'Material Theme was updated. Check the release notes for more details.',
        options: { ok: 'Show me', cancel: 'Maybe later' }
    },
    INSTALLATION: {
        message: 'Thank you for installing Material Theme! Would you like to enable the auto-application (with window reload when needed) of the Material Theme icons?',
        options: { ok: 'Sure!', cancel: 'Nope :(' }
    }
};
exports.infoMessage = () => __awaiter(this, void 0, void 0, function* () {
    const result = yield vscode_1.window.showInformationMessage(MESSAGES.INFO.message, MESSAGES.INFO.options.ok, MESSAGES.INFO.options.cancel);
    switch (result) {
        case MESSAGES.INFO.options.ok:
            return { reload: true };
        default:
            return {};
    }
});
exports.changelogMessage = () => __awaiter(this, void 0, void 0, function* () {
    return (yield vscode_1.window.showInformationMessage(MESSAGES.CHANGELOG.message, MESSAGES.CHANGELOG.options.ok, MESSAGES.CHANGELOG.options.cancel)) === MESSAGES.CHANGELOG.options.ok;
});
exports.installationMessage = () => __awaiter(this, void 0, void 0, function* () {
    return (yield vscode_1.window.showInformationMessage(MESSAGES.INSTALLATION.message, MESSAGES.INSTALLATION.options.ok, MESSAGES.INSTALLATION.options.cancel)) === MESSAGES.INSTALLATION.options.ok;
});
//# sourceMappingURL=messages.js.map