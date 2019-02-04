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
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const os_1 = require("os");
class Linter {
    constructor(extension) {
        this.currentProcesses = {};
        this.extension = extension;
    }
    get rcPath() {
        let rcPath;
        // 0. root file folder
        const root = this.extension.manager.rootFile;
        if (root) {
            rcPath = path.resolve(path.dirname(root), './.chktexrc');
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        // 1. project root folder
        const ws = vscode.workspace.workspaceFolders;
        if (ws && ws.length > 0) {
            rcPath = path.resolve(ws[0].uri.fsPath, './.chktexrc');
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        return undefined;
    }
    lintRootFileIfEnabled() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled')) {
            this.lintRootFile();
        }
    }
    lintActiveFileIfEnabled() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled') &&
            configuration.get('chktex.run') === 'onType') {
            this.lintActiveFile();
        }
    }
    lintActiveFileIfEnabledAfterInterval() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled') &&
            configuration.get('chktex.run') === 'onType') {
            const interval = configuration.get('chktex.delay');
            if (this.linterTimeout) {
                clearTimeout(this.linterTimeout);
            }
            this.linterTimeout = setTimeout(() => this.lintActiveFile(), interval);
        }
    }
    lintActiveFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.getText()) {
                return;
            }
            this.extension.logger.addLogMessage(`Linter for active file started.`);
            const filePath = vscode.window.activeTextEditor.document.fileName;
            const content = vscode.window.activeTextEditor.document.getText();
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const command = configuration.get('chktex.path');
            const args = [...configuration.get('chktex.args.active')];
            if (args.indexOf('-l') < 0) {
                const rcPath = this.rcPath;
                if (rcPath) {
                    args.push('-l', rcPath);
                }
            }
            const requiredArgs = ['-I0', '-f%f:%l:%c:%d:%k:%n:%m\n'];
            let stdout;
            try {
                stdout = yield this.processWrapper('active file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(filePath) }, content);
            }
            catch (err) {
                if ('stdout' in err) {
                    stdout = err.stdout;
                }
                else {
                    return;
                }
            }
            // provide the original path to the active file as the second argument, so
            // we report this second path in the diagnostics instead of the temporary one.
            this.extension.parser.parseLinter(stdout, filePath);
        });
    }
    lintRootFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.extension.logger.addLogMessage(`Linter for root file started.`);
            const filePath = this.extension.manager.rootFile;
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const command = configuration.get('chktex.path');
            const args = [...configuration.get('chktex.args.active')];
            if (args.indexOf('-l') < 0) {
                const rcPath = this.rcPath;
                if (rcPath) {
                    args.push('-l', rcPath);
                }
            }
            const requiredArgs = ['-f%f:%l:%c:%d:%k:%n:%m\n', '%DOC%'.replace('%DOC%', filePath)];
            let stdout;
            try {
                stdout = yield this.processWrapper('root file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(this.extension.manager.rootFile) });
            }
            catch (err) {
                if ('stdout' in err) {
                    stdout = err.stdout;
                }
                else {
                    return;
                }
            }
            this.extension.parser.parseLinter(stdout);
        });
    }
    processWrapper(linterId, command, args, options, stdin) {
        this.extension.logger.addLogMessage(`Linter for ${linterId} running command ${command} with arguments ${args}`);
        return new Promise((resolve, reject) => {
            if (this.currentProcesses[linterId]) {
                this.currentProcesses[linterId].kill();
            }
            const startTime = process.hrtime();
            this.currentProcesses[linterId] = child_process_1.spawn(command, args, options);
            const proc = this.currentProcesses[linterId];
            proc.stdout.setEncoding('utf8');
            proc.stderr.setEncoding('utf8');
            let stdout = '';
            proc.stdout.on('data', newStdout => {
                stdout += newStdout;
            });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Linter for ${linterId} failed to spawn command, encountering error: ${err.message}`);
                return reject(err);
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    this.extension.logger.addLogMessage(`Linter for ${linterId} failed with exit code ${exitCode} and error:\n  ${stderr}`);
                    return reject({ exitCode, stdout, stderr });
                }
                else {
                    const [s, ms] = process.hrtime(startTime);
                    this.extension.logger.addLogMessage(`Linter for ${linterId} successfully finished in ${s}s ${Math.round(ms / 1000000)}ms`);
                    return resolve(stdout);
                }
            });
            if (stdin !== undefined) {
                proc.stdin.write(stdin);
                if (!stdin.endsWith(os_1.EOL)) {
                    // Always ensure we end with EOL otherwise ChkTeX will report line numbers as off by 1.
                    proc.stdin.write(os_1.EOL);
                }
                proc.stdin.end();
            }
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map