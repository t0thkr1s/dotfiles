"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs-extra");
const citation_1 = require("./completer/citation");
const command_1 = require("./completer/command");
const environment_1 = require("./completer/environment");
const reference_1 = require("./completer/reference");
const package_1 = require("./completer/package");
const input_1 = require("./completer/input");
class Completer {
    constructor(extension) {
        this.extension = extension;
        this.citation = new citation_1.Citation(extension);
        this.command = new command_1.Command(extension);
        this.environment = new environment_1.Environment(extension);
        this.reference = new reference_1.Reference(extension);
        this.package = new package_1.Package(extension);
        this.input = new input_1.Input(extension);
        let defaultEnvs;
        let defaultCommands;
        fs.readFile(`${this.extension.extensionRoot}/data/environments.json`)
            .then(data => { defaultEnvs = data.toString(); })
            .then(() => fs.readFile(`${this.extension.extensionRoot}/data/commands.json`))
            .then(data => { defaultCommands = data.toString(); })
            .then(() => {
            const env = JSON.parse(defaultEnvs);
            this.command.initialize(JSON.parse(defaultCommands), env);
            this.environment.initialize(env);
        })
            .catch(err => this.extension.logger.addLogMessage(`Error reading data: ${err}.`));
    }
    provideCompletionItems(document, position, token, context) {
        return new Promise((resolve, _reject) => {
            const invokeChar = document.lineAt(position.line).text[position.character - 1];
            const currentLine = document.lineAt(position.line).text;
            if (position.character > 1 && currentLine[position.character - 1] === '\\' && currentLine[position.character - 2] === '\\') {
                resolve();
                return;
            }
            if (this.command.specialBrackets && this.command.specialBrackets.hasOwnProperty(invokeChar)) {
                if (position.character > 1 && currentLine[position.character - 2] === '\\') {
                    const mathSnippet = Object.assign({}, this.command.specialBrackets[invokeChar]);
                    if (vscode.workspace.getConfiguration('editor', document.uri).get('autoClosingBrackets') &&
                        (currentLine.length > position.character && [')', ']', '}'].indexOf(currentLine[position.character]) > -1)) {
                        mathSnippet.range = new vscode.Range(position.translate(0, -1), position.translate(0, 1));
                    }
                    else {
                        mathSnippet.range = new vscode.Range(position.translate(0, -1), position);
                    }
                    resolve([mathSnippet]);
                    return;
                }
            }
            const line = document.lineAt(position.line).text.substr(0, position.character);
            for (const type of ['citation', 'reference', 'environment', 'package', 'input', 'command']) {
                const suggestions = this.completion(type, line, { document, position, token, context });
                if (suggestions.length > 0) {
                    if (type === 'citation') {
                        const configuration = vscode.workspace.getConfiguration('latex-workshop');
                        if (configuration.get('intellisense.citation.type') === 'browser') {
                            resolve();
                            setTimeout(() => this.citation.browser({ document, position, token, context }), 10);
                            return;
                        }
                    }
                    else if (type === 'command') {
                        const configuration = vscode.workspace.getConfiguration('latex-workshop');
                        if (configuration.get('intellisense.surroundCommand.enabled') && this.command.selection.length > 0) {
                            resolve();
                            setTimeout(() => {
                                this.command.surround(this.command.selection);
                                this.command.selection = '';
                                this.command.shouldClearSelection = true;
                            }, 10);
                            return;
                        }
                    }
                    resolve(suggestions);
                    return;
                }
            }
            resolve();
        });
    }
    completion(type, line, args) {
        let reg;
        let provider;
        let payload;
        switch (type) {
            case 'citation':
                reg = /(?:\\[a-zA-Z]*[Cc]ite[a-zA-Z]*\*?(?:\[[^\[\]]*\])*){([^}]*)$/;
                provider = this.citation;
                break;
            case 'reference':
                reg = /(?:\\hyperref\[([^\]]*)(?!\])$)|(?:(?:\\(?!hyper)[a-zA-Z]*ref[a-zA-Z]*\*?(?:\[[^\[\]]*\])?){([^}]*)$)/;
                provider = this.reference;
                break;
            case 'environment':
                reg = /(?:\\begin(?:\[[^\[\]]*\])?){([^}]*)$/;
                provider = this.environment;
                break;
            case 'command':
                reg = /\\([a-zA-Z]*)$/;
                provider = this.command;
                break;
            case 'package':
                reg = /(?:\\usepackage(?:\[[^\[\]]*\])*){([^}]*)$/;
                provider = this.package;
                break;
            case 'input':
                reg = /(?:\\(input|include|subfile|includegraphics)(?:\[[^\[\]]*\])*){([^}]*)$/;
                provider = this.input;
                break;
            default:
                // This shouldn't be possible, so mark as error case in log.
                this.extension.logger.addLogMessage(`Error - trying to complete unknown type ${type}`);
                return [];
        }
        const result = line.match(reg);
        let suggestions = [];
        if (result) {
            if (type === 'input') {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    payload = [result[1], editor.document.fileName, result[2]];
                }
            }
            else if (type === 'reference' || type === 'citation') {
                payload = args;
            }
            suggestions = provider.provide(payload);
        }
        return suggestions;
    }
}
exports.Completer = Completer;
//# sourceMappingURL=completion.js.map