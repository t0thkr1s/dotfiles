"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ProjectSymbolProvider {
    constructor(extension) {
        this.extension = extension;
    }
    provideWorkspaceSymbols(_query, _token) {
        return new Promise((resolve, _reject) => {
            const symbols = [];
            this.sectionToSymbols(symbols, this.extension.structureProvider.buildModel(this.extension.manager.rootFile));
            resolve(symbols);
        });
    }
    sectionToSymbols(symbols, sections, containerName = 'Document') {
        sections.forEach(section => {
            const location = new vscode.Location(vscode.Uri.file(section.fileName), new vscode.Range(section.lineNumber, 0, section.toLine, 65535));
            symbols.push(new vscode.SymbolInformation(section.label, vscode.SymbolKind.String, containerName, location));
            if (section.children.length > 0) {
                this.sectionToSymbols(symbols, section.children, section.label);
            }
        });
    }
}
exports.ProjectSymbolProvider = ProjectSymbolProvider;
//# sourceMappingURL=projectsymbol.js.map