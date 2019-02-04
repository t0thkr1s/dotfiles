"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs-extra");
class Package {
    constructor(extension) {
        this.suggestions = [];
        this.extension = extension;
    }
    initialize(defaultPackages) {
        Object.keys(defaultPackages).forEach(key => {
            const item = defaultPackages[key];
            const pack = new vscode.CompletionItem(item.command, vscode.CompletionItemKind.Module);
            pack.detail = item.detail;
            pack.documentation = item.documentation;
            this.suggestions.push(pack);
        });
    }
    provide() {
        if (this.suggestions.length === 0) {
            const pkgs = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/packagenames.json`).toString());
            this.initialize(pkgs);
        }
        return this.suggestions;
    }
}
exports.Package = Package;
//# sourceMappingURL=package.js.map