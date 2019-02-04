'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.github.com/gfm/#tables-extension-
const vscode_1 = require("vscode");
const util_1 = require("./util");
function activate(context) {
    context.subscriptions.push(vscode_1.languages.registerDocumentFormattingEditProvider(util_1.mdDocSelector, new MarkdownDocumentFormatter));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
class MarkdownDocumentFormatter {
    provideDocumentFormattingEdits(document, options, token) {
        let edits = [];
        let tables = this.detectTables(document.getText());
        if (tables !== null) {
            tables.forEach(table => {
                edits.push(new vscode_1.TextEdit(this.getRange(document, table), this.formatTable(table, document, options)));
            });
            return edits;
        }
        else {
            return [];
        }
    }
    detectTables(text) {
        const lineBreak = '\\r?\\n';
        const contentLine = '\\|?.*\\|.*\\|?';
        const hyphenLine = '[ \\t]*\\|?( *:?-+:? *\\|)+( *:?-+:? *\\|?)[ \\t]*';
        const tableRegex = new RegExp(contentLine + lineBreak + hyphenLine + '(?:' + lineBreak + contentLine + ')*', 'g');
        return text.match(tableRegex);
    }
    getRange(document, text) {
        let documentText = document.getText();
        let start = document.positionAt(documentText.indexOf(text));
        let end = document.positionAt(documentText.indexOf(text) + text.length);
        return new vscode_1.Range(start, end);
    }
    /**
     * Return the indentation of a table as a string of spaces by reading it from the first line.
     * In case of `markdown.extension.table.normalizeIndentation` is `enabled` it is rounded to the closest multiple of
     * the configured `tabSize`.
     */
    getTableIndentation(text, options) {
        let doNormalize = vscode_1.workspace.getConfiguration('markdown.extension.tableFormatter').get('normalizeIndentation');
        let indentRegex = new RegExp(/^(\s*)\S/u);
        let match = text.match(indentRegex);
        let spacesInFirstLine = match[1].length;
        let tabStops = Math.round(spacesInFirstLine / options.tabSize);
        let spaces = doNormalize ? " ".repeat(options.tabSize * tabStops) : " ".repeat(spacesInFirstLine);
        return spaces;
    }
    formatTable(text, doc, options) {
        let indentation = this.getTableIndentation(text, options);
        let rows = [];
        let rowsNoIndentPattern = new RegExp(/^\s*(\S.*)$/gum);
        let match = null;
        while ((match = rowsNoIndentPattern.exec(text)) !== null) {
            rows.push(match[1].trim());
        }
        // Desired width of each column
        let colWidth = [];
        // Alignment of each column        
        let colAlign = [];
        // Regex to extract cell content.
        // Known issue: `\\|` is not correctly parsed as a valid delimiter
        let fieldRegExp = new RegExp(/(?:\|?((?:\\\||`.*?`|[^\|])+))/gu);
        let cjkRegex = /[\u3000-\u9fff\uff01-\uff60‘“’”—]/g;
        let lines = rows.map((row, num) => {
            let field = null;
            let values = [];
            let i = 0;
            while ((field = fieldRegExp.exec(row)) !== null) {
                let cell = field[1].trim();
                values.push(cell);
                // Ignore length of dash-line to enable width reduction
                if (num != 1) {
                    // Treat CJK characters as 2 English ones because of Unicode stuff
                    let length = cjkRegex.test(cell) ? cell.length + cell.match(cjkRegex).length : cell.length;
                    colWidth[i] = colWidth[i] > length ? colWidth[i] : length;
                }
                i++;
            }
            return values;
        });
        // Normalize the num of hyphen, use Math.max to determine minimum length based on dash-line format
        lines[1] = lines[1].map((cell, i) => {
            if (/:-+:/.test(cell)) {
                //:---:
                colWidth[i] = Math.max(colWidth[i], 5);
                colAlign[i] = 'c';
                return ':' + '-'.repeat(colWidth[i] - 2) + ':';
            }
            else if (/:-+/.test(cell)) {
                //:---
                colWidth[i] = Math.max(colWidth[i], 4);
                colAlign[i] = 'l';
                return ':' + '-'.repeat(colWidth[i] - 1);
            }
            else if (/-+:/.test(cell)) {
                //---:
                colWidth[i] = Math.max(colWidth[i], 4);
                colAlign[i] = 'r';
                return '-'.repeat(colWidth[i] - 1) + ':';
            }
            else if (/-+/.test(cell)) {
                //---
                colWidth[i] = Math.max(colWidth[i], 3);
                colAlign[i] = 'l';
                return '-'.repeat(colWidth[i]);
            }
            else {
                colAlign[i] = 'l';
            }
        });
        return lines.map(row => {
            let cells = row.map((cell, i) => {
                let cellLength = colWidth[i];
                if (cjkRegex.test(cell)) {
                    cellLength -= cell.match(cjkRegex).length;
                }
                //return (cell + ' '.repeat(cellLength)).slice(0, cellLength);
                return this.alignText(cell, colAlign[i], cellLength);
            });
            return indentation + '| ' + cells.join(' | ') + ' |';
        }).join(doc.eol === vscode_1.EndOfLine.LF ? '\n' : '\r\n');
    }
    alignText(text, align, length) {
        if (align === 'c' && length > text.length) {
            return (' '.repeat(Math.floor((length - text.length) / 2)) + text + ' '.repeat(length)).slice(0, length);
        }
        else if (align === 'r') {
            return (' '.repeat(length) + text).slice(-length);
        }
        else {
            return (text + ' '.repeat(length)).slice(0, length);
        }
    }
}
//# sourceMappingURL=tableFormatter.js.map