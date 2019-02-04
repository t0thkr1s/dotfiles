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
const chokidar = require("chokidar");
const glob = require("glob");
class Manager {
    constructor(extension) {
        this.texFileTree = {};
        this.extension = extension;
        this.filesWatched = [];
        this.bibsWatched = [];
        this.rootFiles = {};
        this.workspace = '';
    }
    getOutputDir(texPath) {
        const doc = texPath.replace(/\.tex$/, '').split(path.sep).join('/');
        const docfile = path.basename(texPath, '.tex').split(path.sep).join('/');
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const docker = configuration.get('docker.enabled');
        let outDir = configuration.get('latex.outDir');
        outDir = outDir.replace('%DOC%', docker ? docfile : doc)
            .replace('%DOCFILE%', docfile)
            .replace('%DIR%', path.dirname(texPath).split(path.sep).join('/'))
            .replace('%TMPDIR%', this.extension.builder.tmpDir);
        return outDir;
    }
    get rootDir() {
        return path.dirname(this.rootFile);
    }
    get rootFile() {
        return this.rootFiles[this.workspace];
    }
    set rootFile(root) {
        this.rootFiles[this.workspace] = root;
    }
    tex2pdf(texPath, respectOutDir = true) {
        let outputDir = './';
        if (respectOutDir) {
            outputDir = this.getOutputDir(texPath);
        }
        return path.resolve(path.dirname(texPath), outputDir, path.basename(`${texPath.substr(0, texPath.lastIndexOf('.'))}.pdf`));
    }
    hasTexId(id) {
        return (id === 'tex' || id === 'latex' || id === 'doctex');
    }
    // Remove all the comments
    stripComments(text, commentSign) {
        const pattern = '([^\\\\]|^)' + commentSign + '.*$';
        const reg = RegExp(pattern, 'gm');
        return text.replace(reg, '$1');
    }
    // Given an input file determine its full path using the prefixes dirs
    resolveFile(dirs, inputFile, suffix = '.tex') {
        if (inputFile.startsWith('/')) {
            dirs.unshift('');
        }
        for (const d of dirs) {
            let inputFilePath = path.resolve(d, inputFile);
            if (path.extname(inputFilePath) === '') {
                inputFilePath += suffix;
            }
            if (!fs.existsSync(inputFilePath) && fs.existsSync(inputFilePath + suffix)) {
                inputFilePath += suffix;
            }
            if (fs.existsSync(inputFilePath)) {
                return inputFilePath;
            }
        }
        return null;
    }
    updateWorkspace() {
        let wsroot = vscode.workspace.rootPath;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            const wsfolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
            if (wsfolder) {
                wsroot = wsfolder.uri.fsPath;
            }
        }
        if (wsroot) {
            if (wsroot !== this.workspace) {
                this.workspace = wsroot;
            }
        }
        else {
            this.workspace = '';
        }
    }
    findRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateWorkspace();
            const findMethods = [() => this.findRootMagic(), () => this.findRootSelf(), () => this.findRootDir()];
            for (const method of findMethods) {
                const rootFile = yield method();
                if (rootFile !== undefined) {
                    if (this.rootFile !== rootFile) {
                        this.extension.logger.addLogMessage(`Root file changed from: ${this.rootFile}. Find all dependencies.`);
                        this.rootFile = rootFile;
                        this.findAllDependentFiles(rootFile);
                    }
                    else {
                        this.extension.logger.addLogMessage(`Root file remains unchanged from: ${this.rootFile}.`);
                    }
                    return rootFile;
                }
            }
            return undefined;
        });
    }
    findRootMagic() {
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        const regex = /^(?:%\s*!\s*T[Ee]X\sroot\s*=\s*(.*\.tex)$)/m;
        let content = vscode.window.activeTextEditor.document.getText();
        let result = content.match(regex);
        const fileStack = [];
        if (result) {
            let file = path.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName), result[1]);
            fileStack.push(file);
            this.extension.logger.addLogMessage(`Found root file by magic comment: ${file}`);
            content = fs.readFileSync(file).toString();
            result = content.match(regex);
            while (result) {
                file = path.resolve(path.dirname(file), result[1]);
                if (fileStack.indexOf(file) > -1) {
                    this.extension.logger.addLogMessage(`Looped root file by magic comment found: ${file}, stop here.`);
                    return file;
                }
                else {
                    fileStack.push(file);
                    this.extension.logger.addLogMessage(`Recursively found root file by magic comment: ${file}`);
                }
                content = fs.readFileSync(file).toString();
                result = content.match(regex);
            }
            return file;
        }
        return undefined;
    }
    findRootSelf() {
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        const regex = /\\begin{document}/m;
        const content = this.stripComments(vscode.window.activeTextEditor.document.getText(), '%');
        const result = content.match(regex);
        if (result) {
            const file = vscode.window.activeTextEditor.document.fileName;
            this.extension.logger.addLogMessage(`Found root file from active editor: ${file}`);
            return file;
        }
        return undefined;
    }
    findSubFiles() {
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        const regex = /(?:\\documentclass\[(.*(?:\.tex))\]{subfiles})/;
        const content = this.stripComments(vscode.window.activeTextEditor.document.getText(), '%');
        const result = content.match(regex);
        if (result) {
            const file = path.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName), result[1]);
            this.extension.logger.addLogMessage(`Found root file of this subfile from active editor: ${file}`);
            return file;
        }
        return undefined;
    }
    findRootDir() {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /\\begin{document}/m;
            if (!this.workspace) {
                return undefined;
            }
            try {
                const urls = yield vscode.workspace.findFiles('**/*.tex', undefined);
                for (const url of urls) {
                    const content = this.stripComments(fs.readFileSync(url.fsPath).toString(), '%');
                    const result = content.match(regex);
                    if (result) {
                        const file = url.fsPath;
                        this.extension.logger.addLogMessage(`Try root file in root directory: ${file}`);
                        const window = vscode.window;
                        if (window && window.activeTextEditor && this.isRoot(url.fsPath, window.activeTextEditor.document.fileName, true)) {
                            this.extension.logger.addLogMessage(`Found root file in root directory: ${file}`);
                            return file;
                        }
                    }
                }
            }
            catch (e) { }
            return undefined;
        });
    }
    isRoot(root, file, updateDependent = false) {
        if (!fs.existsSync(root)) {
            return false;
        }
        if (root === file) {
            return true;
        }
        if (updateDependent) {
            this.findDependentFiles(root, undefined, true);
        }
        if (!this.texFileTree.hasOwnProperty(root) || !this.texFileTree.hasOwnProperty(file)) {
            return false;
        }
        for (const r of this.texFileTree[root]) {
            if (this.isRoot(r, file)) {
                return true;
            }
        }
        return false;
    }
    findAllDependentFiles(rootFile) {
        let prevWatcherClosed = false;
        if (this.fileWatcher !== undefined && this.filesWatched.indexOf(rootFile) < 0) {
            // We have an instantiated fileWatcher, but the rootFile is not being watched.
            // => the user has changed the root. Clean up the old watcher so we reform it.
            this.extension.logger.addLogMessage(`Root file changed -> cleaning up old file watcher.`);
            this.fileWatcher.close();
            this.filesWatched = [];
            prevWatcherClosed = true;
            // We also clean the completions from the old project
            this.extension.completer.reference.reset();
            this.extension.completer.command.reset();
            this.extension.completer.citation.reset();
        }
        if (prevWatcherClosed || this.fileWatcher === undefined) {
            this.extension.logger.addLogMessage(`Instatiating new file watcher for ${rootFile}`);
            this.fileWatcher = chokidar.watch(rootFile);
            this.filesWatched.push(rootFile);
            this.fileWatcher.on('change', (filePath) => {
                this.extension.logger.addLogMessage(`File watcher: responding to change in ${filePath}`);
                this.findDependentFiles(filePath);
            });
            this.fileWatcher.on('unlink', (filePath) => __awaiter(this, void 0, void 0, function* () {
                this.extension.logger.addLogMessage(`File watcher: ${filePath} deleted.`);
                this.fileWatcher.unwatch(filePath);
                this.filesWatched.splice(this.filesWatched.indexOf(filePath), 1);
                if (filePath === rootFile) {
                    this.extension.logger.addLogMessage(`Deleted ${filePath} was root - triggering root search`);
                    yield this.findRoot();
                }
            }));
            this.findDependentFiles(rootFile);
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const additionalBib = configuration.get('latex.additionalBib');
            for (const bibGlob of additionalBib) {
                glob(bibGlob, { cwd: this.extension.manager.rootDir }, (err, files) => {
                    if (err) {
                        this.extension.logger.addLogMessage(`Error identifying additional bibfile with glob ${bibGlob}: ${files}.`);
                        return;
                    }
                    for (const bib of files) {
                        this.extension.logger.addLogMessage(`Try to watch global bibliography file ${bib}.`);
                        this.addBibToWatcher(bib, this.extension.manager.rootDir);
                    }
                });
            }
        }
    }
    findDependentFiles(filePath, rootDir = undefined, fast = false) {
        if (!rootDir) {
            rootDir = path.dirname(filePath);
        }
        this.extension.logger.addLogMessage(`Parsing ${filePath}`);
        const content = this.stripComments(fs.readFileSync(filePath, 'utf-8'), '%');
        const inputReg = /(?:\\(?:input|InputIfFileExists|include|subfile|(?:(?:sub)?import\*?{([^}]*)}))(?:\[[^\[\]\{\}]*\])?){([^}]*)}/g;
        this.texFileTree[filePath] = new Set();
        while (true) {
            const result = inputReg.exec(content);
            if (!result) {
                break;
            }
            let inputFilePath;
            if (result[0].startsWith('\\subimport')) {
                inputFilePath = this.resolveFile([path.dirname(filePath)], path.resolve(result[1], result[2]));
            }
            else if (result[0].startsWith('\\import')) {
                inputFilePath = this.extension.manager.resolveFile([result[1]], result[2]);
            }
            else {
                inputFilePath = this.resolveFile([path.dirname(filePath), rootDir], result[2]);
            }
            if (inputFilePath && fs.existsSync(inputFilePath)) {
                this.texFileTree[filePath].add(inputFilePath);
                if (!fast && this.fileWatcher && this.filesWatched.indexOf(inputFilePath) < 0) {
                    this.extension.logger.addLogMessage(`Adding ${inputFilePath} to file watcher.`);
                    this.fileWatcher.add(inputFilePath);
                    this.filesWatched.push(inputFilePath);
                }
                this.findDependentFiles(inputFilePath, rootDir);
            }
        }
        if (fast) {
            return;
        }
        const bibReg = /(?:\\(?:bibliography|addbibresource)(?:\[[^\[\]\{\}]*\])?){(.+?)}|(?:\\putbib)\[(.+?)\]/g;
        while (true) {
            const result = bibReg.exec(content);
            if (!result) {
                break;
            }
            const bibs = (result[1] ? result[1] : result[2]).split(',').map((bib) => {
                return bib.trim();
            });
            for (const bib of bibs) {
                this.addBibToWatcher(bib, rootDir, this.extension.manager.rootFile);
            }
        }
        this.onFileChange(filePath);
    }
    onFileChange(filePath) {
        this.extension.completer.command.getCommandsTeX(filePath);
        this.extension.completer.command.getPackage(filePath);
        this.extension.completer.reference.getReferencesTeX(filePath);
        this.extension.completer.citation.getTheBibliographyTeX(filePath);
    }
    addBibToWatcher(bib, rootDir, rootFile = undefined) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const bibDirs = configuration.get('latex.bibDirs');
        const bibPath = this.resolveFile([rootDir, ...bibDirs], bib, '.bib');
        if (!bibPath) {
            this.extension.logger.addLogMessage(`Cannot find .bib file ${bib}`);
            return;
        }
        this.extension.logger.addLogMessage(`Found .bib file ${bibPath}`);
        if (this.bibWatcher === undefined) {
            this.extension.logger.addLogMessage(`Creating file watcher for .bib files.`);
            this.bibWatcher = chokidar.watch('');
            this.bibWatcher.on('change', (filePath) => {
                this.extension.logger.addLogMessage(`Bib file watcher - responding to change in ${filePath}`);
                this.extension.completer.citation.parseBibFile(filePath);
            });
            this.bibWatcher.on('unlink', (filePath) => {
                this.extension.logger.addLogMessage(`Bib file watcher: ${filePath} deleted.`);
                this.extension.completer.citation.forgetParsedBibItems(filePath);
                this.bibWatcher.unwatch(filePath);
                this.bibsWatched.splice(this.bibsWatched.indexOf(filePath), 1);
            });
        }
        if (this.bibsWatched.indexOf(bibPath) < 0) {
            this.extension.logger.addLogMessage(`Adding .bib file ${bibPath} to bib file watcher.`);
            this.bibWatcher.add(bibPath);
            this.bibsWatched.push(bibPath);
            this.extension.completer.citation.parseBibFile(bibPath, rootFile);
        }
        else {
            const texFiles = this.extension.completer.citation.citationInBib[bibPath].rootFiles;
            if (rootFile && texFiles.indexOf(rootFile) < 0) {
                texFiles.push(rootFile);
            }
            this.extension.logger.addLogMessage(`.bib file ${bibPath} is already being watched.`);
        }
    }
    setEnvVar() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        process.env['LATEXWORKSHOP_DOCKER_LATEX'] = configuration.get('docker.image.latex');
    }
}
exports.Manager = Manager;
//# sourceMappingURL=manager.js.map