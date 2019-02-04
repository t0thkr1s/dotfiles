"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs-extra");
const path = require("path");
const micromatch = require("micromatch");
const cp = require("child_process");
const ignoreFiles = ['**/.vscode', '**/.vscodeignore', '**/.gitignore'];
class Input {
    constructor(extension) {
        this.extension = extension;
    }
    provide(payload) {
        const mode = payload[0];
        const currentFile = payload[1];
        const typedFolder = payload[2];
        const suggestions = [];
        let baseDir;
        if (mode === 'include') {
            baseDir = path.dirname(currentFile);
        }
        else {
            baseDir = path.dirname(this.extension.manager.rootFile);
        }
        if (typedFolder !== '') {
            baseDir = path.resolve(baseDir, typedFolder);
        }
        try {
            const files = fs.readdirSync(baseDir);
            const excludeGlob = (Object.keys(vscode.workspace.getConfiguration('files', null).get('exclude') || {})).concat(ignoreFiles);
            let gitIgnoredFiles = [];
            /* Check .gitignore if needed */
            if (vscode.workspace.getConfiguration('search', null).get('useIgnoreFiles')) {
                try {
                    gitIgnoredFiles = (cp.execSync('git check-ignore ' + files.join(' '), { cwd: baseDir })).toString().split('\n');
                }
                catch (ex) { }
            }
            files.forEach(file => {
                const filePath = path.resolve(baseDir, file);
                /* Check if the file should be ignored */
                if ((gitIgnoredFiles.indexOf(file) > -1) || micromatch.any(filePath, excludeGlob, { basename: true })) {
                    return;
                }
                if (fs.lstatSync(filePath).isDirectory()) {
                    const item = new vscode.CompletionItem(`${file}/`, vscode.CompletionItemKind.Folder);
                    item.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                    suggestions.push(item);
                }
                else {
                    suggestions.push(new vscode.CompletionItem(file, vscode.CompletionItemKind.File));
                }
            });
        }
        catch (error) { }
        return suggestions;
    }
}
exports.Input = Input;
//# sourceMappingURL=input.js.map