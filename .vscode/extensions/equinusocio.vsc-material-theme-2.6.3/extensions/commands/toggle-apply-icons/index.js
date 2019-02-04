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
const vscode = require("vscode");
exports.default = () => __awaiter(this, void 0, void 0, function* () {
    // shows the quick pick dropdown and wait response
    const optionSelected = yield vscode.window.showQuickPick(['Enable', 'Disable']);
    const isEnable = optionSelected === 'Enable';
    return Promise.resolve(vscode.workspace
        .getConfiguration().update('materialTheme.autoApplyIcons', isEnable, true));
});
//# sourceMappingURL=index.js.map