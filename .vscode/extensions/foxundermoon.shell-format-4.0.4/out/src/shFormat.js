"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const pathUtil_1 = require("./pathUtil");
const diffUtils_1 = require("../src/diffUtils");
exports.configurationPrefix = "shellformat";
var ConfigItemName;
(function (ConfigItemName) {
    ConfigItemName["Flag"] = "flag";
    ConfigItemName["Path"] = "path";
    ConfigItemName["EffectLanguages"] = "effectLanguages";
    ConfigItemName["ShowError"] = "showError";
})(ConfigItemName = exports.ConfigItemName || (exports.ConfigItemName = {}));
const shfmtVersion = "v2.6.2";
const defaultDownloadShfmtPath = "/usr/local/bin/shfmt";
const fileExtensionMap = {
    arm: "arm",
    arm64: "arm",
    ia32: "386",
    mips: "mips",
    x32: "386",
    x64: "amd64"
};
class Formatter {
    formatDocument(document, options) {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        const range = new vscode.Range(start, end);
        const content = document.getText(range);
        return this.formatDocumentWithContent(content, document.fileName, options);
    }
    formatDocumentWithContent(content, filename, options) {
        return new Promise((resolve, reject) => {
            try {
                let formatFlags = []; //todo add user configuration
                let settings = vscode.workspace.getConfiguration(exports.configurationPrefix);
                if (settings) {
                    let flag = settings["flag"];
                    if (flag) {
                        if (flag.includes("-w")) {
                            vscode.window.showWarningMessage("can not set -w flag  please fix config");
                        }
                        let flags = flag.split(" ");
                        formatFlags.push(...flags);
                    }
                    let binPath = settings["path"];
                    if (binPath) {
                        if (pathUtil_1.fileExists(binPath)) {
                            Formatter.formatCommand = binPath;
                        }
                        else {
                            vscode.window.showErrorMessage("the config shellformat.path file not exists please fix it");
                        }
                    }
                    else {
                        if (!binPath &&
                            process.platform != "win32" &&
                            pathUtil_1.fileExists(defaultDownloadShfmtPath)) {
                            Formatter.formatCommand = defaultDownloadShfmtPath;
                        }
                    }
                }
                if (options && options.insertSpaces) {
                    formatFlags.push("-i", options.tabSize);
                }
                let fmtSpawn = cp.spawn(Formatter.formatCommand, formatFlags);
                let output = [];
                let errorOutput = [];
                let textEdits = [];
                fmtSpawn.stdout.on("data", chunk => {
                    let bc;
                    if (chunk instanceof Buffer) {
                        bc = chunk;
                    }
                    else {
                        bc = new Buffer(chunk);
                    }
                    output.push(bc);
                });
                fmtSpawn.stderr.on("data", chunk => {
                    let bc;
                    if (chunk instanceof Buffer) {
                        bc = chunk;
                    }
                    else {
                        bc = new Buffer(chunk);
                    }
                    errorOutput.push(bc);
                });
                fmtSpawn.on("close", code => {
                    if (code == 0) {
                        if (output.length == 0) {
                            resolve(null);
                        }
                        else {
                            let result = Buffer.concat(output).toString();
                            let filePatch = diffUtils_1.getEdits(filename, content, result);
                            filePatch.edits.forEach(edit => {
                                textEdits.push(edit.apply());
                            });
                            resolve(textEdits);
                        }
                    }
                    else {
                        let errMsg = "";
                        if (errorOutput.length != 0) {
                            errMsg = Buffer.concat(errorOutput).toString();
                            const showError = settings["showError"];
                            if (showError) {
                                vscode.window.showErrorMessage(errMsg);
                            }
                        }
                        // vscode.window.showWarningMessage('shell format error  please commit one issue to me:' + errMsg);
                        reject(errMsg);
                    }
                });
                fmtSpawn.stdin.write(content);
                fmtSpawn.stdin.end();
            }
            catch (e) {
                reject("Internal issues when formatted content");
            }
        });
    }
}
Formatter.formatCommand = "shfmt";
exports.Formatter = Formatter;
class ShellDocumentFormattingEditProvider {
    constructor(formatter, settings) {
        if (formatter) {
            this.formatter = formatter;
        }
        else {
            this.formatter = new Formatter();
        }
        if (settings === undefined) {
            this.settings = vscode.workspace.getConfiguration(exports.configurationPrefix);
        }
        else {
            this.settings = settings;
        }
    }
    provideDocumentFormattingEdits(document, options, token) {
        // const onSave = this.settings["onsave"];
        // if (!onSave) {
        //   console.log(onSave);
        // }
        return this.formatter.formatDocument(document, options);
    }
}
exports.ShellDocumentFormattingEditProvider = ShellDocumentFormattingEditProvider;
function checkEnv() {
    const settings = vscode.workspace.getConfiguration(exports.configurationPrefix);
    let configBinPath = false;
    if (settings) {
        let flag = settings.get(ConfigItemName.Flag);
        if (flag) {
            if (flag.includes("-w")) {
                vscode.window.showWarningMessage("can not set -w flag  please fix config");
            }
        }
        let binPath = settings.get(ConfigItemName.Path);
        if (binPath) {
            configBinPath = true;
            if (pathUtil_1.fileExists(binPath)) {
                this.formatCommand = binPath;
            }
            else {
                vscode.window.showErrorMessage(`the config [${exports.configurationPrefix}.${ConfigItemName.Path}] file not exists please fix it`);
            }
        }
    }
    if (!configBinPath && !isExecutedFmtCommand()) {
        if (process.platform == "darwin") {
            installFmtForMaxos();
        }
        else if ([
            // "android",
            // "darwin",
            "freebsd",
            "linux",
            "openbsd"
            // "sunos",
            // "win32",
            // "cygwin"
        ].includes(process.platform)) {
            installForLinux();
        }
        else {
            showMamualInstallMessage();
        }
    }
}
exports.checkEnv = checkEnv;
function showMamualInstallMessage() {
    vscode.window.showErrorMessage(`[${exports.configurationPrefix}.${ConfigItemName.Path}]not found!  please install  manual https://mvdan.cc/sh/cmd/shfmt `);
}
function installFmtForMaxos() {
    if (pathUtil_1.getExecutableFileUnderPath("brew")) {
        vscode.window.showInformationMessage("will install shfmt by brew");
        const terminal = vscode.window.createTerminal();
        terminal.show();
        terminal.sendText("brew install shfmt", true);
        terminal.sendText("echo '**Enjoy shellscript!**'", true);
        terminal.sendText("echo 'fork or star  https://github.com/foxundermoon/vs-shell-format'", true);
    }
    else {
        installForLinux();
    }
}
function installForLinux() {
    try {
        const url = getDownloadUrl();
        vscode.window.showInformationMessage("will install shfmt by curl");
        const terminal = vscode.window.createTerminal();
        terminal.show();
        terminal.sendText("mkdir -p /usr/local/bin", true);
        terminal.sendText(`curl -L '${url}' --output  /usr/local/bin/shfmt`, true);
        terminal.sendText(`chmod a+x /usr/local/bin/shfmt`, true);
        terminal.sendText("echo '**Enjoy shellscript!**'", true);
        terminal.sendText("echo 'fork or star  https://github.com/foxundermoon/vs-shell-format'", true);
    }
    catch (error) {
        vscode.window.showWarningMessage("install shfmt faild , please install manual https://mvdan.cc/sh/cmd/shfmt");
    }
}
function getDownloadUrl() {
    try {
        const extension = fileExtensionMap[process.arch];
        const url = `https://github.com/mvdan/sh/releases/download/${shfmtVersion}/shfmt_${shfmtVersion}_${process.platform}_${extension}`;
        return url;
    }
    catch (error) {
        throw new Error("nor sourport");
    }
}
function isExecutedFmtCommand() {
    return pathUtil_1.getExecutableFileUnderPath(Formatter.formatCommand) != null;
}
//# sourceMappingURL=shFormat.js.map