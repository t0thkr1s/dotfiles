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
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
class Counter {
    constructor(extension) {
        this.extension = extension;
    }
    count(file, merge = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.extension.manager.rootFile !== undefined) {
                yield this.extension.manager.findRoot();
            }
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const args = configuration.get('texcount.args');
            if (merge) {
                args.push('-merge');
            }
            let command = configuration.get('texcount.path');
            if (configuration.get('docker.enabled')) {
                if (process.platform === 'win32') {
                    command = path.resolve(this.extension.extensionRoot, './scripts/texcount.bat');
                }
                else {
                    command = path.resolve(this.extension.extensionRoot, './scripts/texcount');
                    fs.chmodSync(command, 0o755);
                }
            }
            this.extension.manager.setEnvVar();
            const proc = cp.spawn(command, args.concat([path.basename(file)]), { cwd: path.dirname(file) });
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
                this.extension.logger.addLogMessage(`Cannot count words: ${err.message}, ${stderr}`);
                this.extension.logger.showErrorMessage('TeXCount failed. Please refer to LaTeX Workshop Output for details.');
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    this.extension.logger.addLogMessage(`Cannot count words, code: ${exitCode}, ${stderr}`);
                    this.extension.logger.showErrorMessage('TeXCount failed. Please refer to LaTeX Workshop Output for details.');
                }
                else {
                    const words = /Words in text: ([0-9]*)/g.exec(stdout);
                    const floats = /Number of floats\/tables\/figures: ([0-9]*)/g.exec(stdout);
                    if (words) {
                        let floatMsg = '';
                        if (floats && parseInt(floats[1]) > 0) {
                            floatMsg = `and ${floats[1]} float${parseInt(floats[1]) > 1 ? 's' : ''} (tables, figures, etc.) `;
                        }
                        vscode.window.showInformationMessage(`There are ${words[1]} words ${floatMsg}in the ${merge ? 'LaTeX project' : 'opened LaTeX file'}.`);
                    }
                    this.extension.logger.addLogMessage(`TeXCount log:\n${stdout}`);
                }
            });
        });
    }
}
exports.Counter = Counter;
//# sourceMappingURL=counter.js.map