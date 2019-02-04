"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs-extra");
class Environment {
    constructor(extension) {
        this.defaults = {};
        this.packageEnvs = {};
        this.extension = extension;
    }
    initialize(defaultEnvs) {
        defaultEnvs.forEach(env => {
            const environment = new vscode.CompletionItem(env, vscode.CompletionItemKind.Module);
            this.defaults[env] = environment;
        });
    }
    provide() {
        if (Date.now() - this.refreshTimer < 1000) {
            return this.suggestions;
        }
        this.refreshTimer = Date.now();
        const suggestions = Object.assign({}, this.defaults);
        this.extension.completer.command.usedPackages.forEach(pkg => this.insertPkgEnvs(pkg, suggestions));
        this.suggestions = Object.keys(suggestions).map(key => suggestions[key]);
        return this.suggestions;
    }
    insertPkgEnvs(pkg, suggestions) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (!(configuration.get('intellisense.package.enabled'))) {
            return;
        }
        if (!(pkg in this.packageEnvs)) {
            const filePath = `${this.extension.extensionRoot}/data/packages/${pkg}_env.json`;
            if (fs.existsSync(filePath)) {
                this.packageEnvs[pkg] = [];
                const envs = JSON.parse(fs.readFileSync(filePath).toString());
                envs.forEach(env => {
                    if (env in suggestions) {
                        return;
                    }
                    this.packageEnvs[pkg][env] = new vscode.CompletionItem(env, vscode.CompletionItemKind.Module);
                });
            }
        }
        if (pkg in this.packageEnvs) {
            Object.keys(this.packageEnvs[pkg]).forEach(env => {
                suggestions[env] = this.packageEnvs[pkg][env];
            });
        }
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map