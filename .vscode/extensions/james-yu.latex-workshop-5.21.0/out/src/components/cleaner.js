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
const fs = require("fs-extra");
const glob = require("glob");
class Cleaner {
    constructor(extension) {
        this.extension = extension;
    }
    clean() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.extension.manager.rootFile !== undefined) {
                yield this.extension.manager.findRoot();
            }
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            let globs = configuration.get('latex.clean.fileTypes');
            let outdir = this.extension.manager.getOutputDir(this.extension.manager.rootFile);
            if (!outdir.endsWith('/') && !outdir.endsWith('\\')) {
                outdir += path.sep;
            }
            if (outdir !== './' && outdir !== '.') {
                globs = globs.concat(globs.map(globType => outdir + globType), globs.map(globType => outdir + '**/' + globType));
            }
            return Promise.all(
            // Get an array of arrays containing all the files found by the globs
            globs.map(g => this.globP(g, { cwd: this.extension.manager.rootDir }))).then(files => files
                // Reduce the array of arrays to a single array containing all the files that should be delted
                .reduce((all, curr) => all.concat(curr), [])
                // Resolve the absoulte filepath for every file
                .map(file => path.resolve(this.extension.manager.rootDir, file))).then(files => Promise.all(
            // Try to unlink the files, returning a Promise for every file
            files.map(file => fs.unlink(file).then(() => {
                this.extension.logger.addLogMessage(`File cleaned: ${file}`);
                // If unlinking fails, replace it with an rmdir Promise
            }, () => fs.rmdir(file).then(() => {
                this.extension.logger.addLogMessage(`Folder removed: ${file}`);
            }, () => {
                this.extension.logger.addLogMessage(`Error removing file: ${file}`);
            }))))).then(() => { } // Do not pass results to Promise returned by clean()
            ).catch(err => {
                this.extension.logger.addLogMessage(`Error during deletion of files: ${err}`);
            });
        });
    }
    // This function wraps the glob package into a promise.
    // It behaves like the original apart from returning a Promise instead of requiring a Callback.
    globP(pattern, options) {
        return new Promise((resolve, reject) => {
            glob(pattern, options, (err, files) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(files);
                }
            });
        });
    }
}
exports.Cleaner = Cleaner;
//# sourceMappingURL=cleaner.js.map