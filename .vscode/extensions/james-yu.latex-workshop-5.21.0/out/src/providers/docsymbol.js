"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class DocSymbolProvider {
    constructor(extension) {
        this.sections = [];
        this.extension = extension;
        const rawSections = vscode.workspace.getConfiguration('latex-workshop').get('view.outline.sections');
        rawSections.forEach(section => {
            this.sections = this.sections.concat(section.split('|'));
        });
    }
    provideDocumentSymbols(document) {
        return new Promise((resolve, _reject) => {
            resolve(this.sectionToSymbols(this.extension.structureProvider.buildModel(document.fileName, undefined, undefined, false)));
        });
    }
    sectionToSymbols(sections) {
        const symbols = [];
        sections.forEach(section => {
            const range = new vscode.Range(section.lineNumber, 0, section.toLine, 65535);
            const symbol = new vscode.DocumentSymbol(section.label, '', vscode.SymbolKind.String, range, range);
            symbols.push(symbol);
            if (section.children.length > 0) {
                symbol.children = this.sectionToSymbols(section.children);
            }
        });
        return symbols;
    }
}
exports.DocSymbolProvider = DocSymbolProvider;
//# sourceMappingURL=docsymbol.js.map