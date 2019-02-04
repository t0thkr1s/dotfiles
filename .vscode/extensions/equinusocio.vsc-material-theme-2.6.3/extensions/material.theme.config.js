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
const ThemeCommands = require("./commands");
const settings_1 = require("./helpers/settings");
const configuration_change_1 = require("./helpers/configuration-change");
const messages_1 = require("./helpers/messages");
const check_installation_1 = require("./helpers/check-installation");
const write_changelog_1 = require("./helpers/write-changelog");
const ReleaseNotes_1 = require("./webviews/ReleaseNotes");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode_1.workspace.getConfiguration();
        const installationType = check_installation_1.default();
        const releaseNotesView = new ReleaseNotes_1.ReleaseNotesWebview(context);
        write_changelog_1.default();
        // Listen on set theme: when the theme is Material Theme, just adjust icon and accent.
        vscode_1.workspace.onDidChangeConfiguration(configuration_change_1.onChangeConfiguration);
        // Delete old configuration, must remove with next major release
        if (config.has('materialTheme.cache.workbench')) {
            config.update('materialTheme.cache.workbench', undefined, true);
        }
        if (installationType.isFirstInstall) {
            const enableAutoApply = yield messages_1.installationMessage();
            yield settings_1.setCustomSetting('autoApplyIcons', enableAutoApply);
            // Set true always on new installation
            yield settings_1.setCustomSetting('showReloadNotification', true);
        }
        const shouldShowChangelog = (installationType.isFirstInstall || installationType.isUpdate) && (yield messages_1.changelogMessage());
        if (shouldShowChangelog) {
            releaseNotesView.show();
        }
        // Registering commands
        vscode_1.commands.registerCommand('materialTheme.setAccent', () => __awaiter(this, void 0, void 0, function* () {
            const accentPicked = yield ThemeCommands.accentsQuickPick();
            yield settings_1.updateAccent(accentPicked);
        }));
        vscode_1.commands.registerCommand('materialTheme.fixIcons', () => ThemeCommands.fixIcons());
        vscode_1.commands.registerCommand('materialTheme.toggleApplyIcons', () => ThemeCommands.toggleApplyIcons());
        vscode_1.commands.registerCommand('materialTheme.showReleaseNotes', () => releaseNotesView.show());
    });
}
exports.activate = activate;
//# sourceMappingURL=material.theme.config.js.map