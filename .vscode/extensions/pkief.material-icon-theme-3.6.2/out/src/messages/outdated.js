"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode = require("vscode");
const i18n = require("./../i18n");
/** Show message that the editor version is outdated. */
exports.showOutdatedMessage = () => {
    vscode.window.showWarningMessage(i18n.translate('outdatedVersion'), i18n.translate('updateVSCode'), i18n.translate('howToActivate')).then(handleActivateActions);
};
/** Handle the actions from the outdatedMessage command message */
const handleActivateActions = (value) => {
    switch (value) {
        case i18n.translate('howToActivate'):
            opn('https://code.visualstudio.com/blogs/2016/09/08/icon-themes#_file-icon-themes');
            break;
        case i18n.translate('updateVSCode'):
            opn('https://code.visualstudio.com/download');
            break;
        default:
            break;
    }
};
//# sourceMappingURL=outdated.js.map