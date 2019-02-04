"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
class Viewer {
    constructor(extension) {
        this.clients = {};
        this.positions = {};
        this.extension = extension;
    }
    refreshExistingViewer(sourceFile, viewer) {
        if (!sourceFile) {
            Object.keys(this.clients).forEach(key => {
                this.clients[key].forEach(client => {
                    client.websocket.send(JSON.stringify({ type: 'refresh' }));
                });
            });
            return true;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const clients = this.clients[pdfFile.toLocaleUpperCase()];
        if (clients !== undefined) {
            let refreshed = false;
            // Check all viewer clients with the same path
            clients.forEach(client => {
                // Skip disconnected
                if (client.websocket === undefined) {
                    return;
                }
                // Refresh only correct type
                if (viewer === undefined || client.viewer === viewer) {
                    this.extension.logger.addLogMessage(`Refresh PDF viewer for ${pdfFile}`);
                    client.websocket.send(JSON.stringify({ type: 'refresh' }));
                    refreshed = true;
                }
            });
            // Return if refreshed anyone
            if (refreshed) {
                return true;
            }
        }
        this.extension.logger.addLogMessage(`No PDF viewer connected for ${pdfFile}`);
        return false;
    }
    checkViewer(sourceFile, respectOutDir = true) {
        const pdfFile = this.extension.manager.tex2pdf(sourceFile, respectOutDir);
        if (!fs.existsSync(pdfFile)) {
            this.extension.logger.addLogMessage(`Cannot find PDF file ${pdfFile}`);
            return;
        }
        if (this.extension.server.address === undefined) {
            this.extension.logger.addLogMessage(`Cannot establish server connection.`);
            return;
        }
        // vscode.URI.parse and pdfjs viewer automatically call decodeURIComponent.
        // So, to pass the encoded path of a pdf file to the http server,
        // we have to call encodeURIComponent three times! 3 - 2 = 1 !
        const url = `http://${this.extension.server.address}/viewer.html?file=/pdf:${encodeURIComponent(encodeURIComponent(encodeURIComponent(pdfFile)))}`;
        this.extension.logger.addLogMessage(`Serving PDF file at ${url}`);
        return url;
    }
    openBrowser(sourceFile) {
        const url = this.checkViewer(sourceFile, true);
        if (!url) {
            return;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        this.clients[pdfFile.toLocaleUpperCase()] = this.clients[pdfFile.toLocaleUpperCase()] || [];
        try {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
            this.extension.logger.addLogMessage(`Open PDF viewer for ${pdfFile}`);
        }
        catch (e) {
            vscode.window.showInputBox({
                prompt: 'Unable to open browser. Please copy and visit this link.',
                value: url
            });
            this.extension.logger.addLogMessage(`Something bad happened when opening PDF viewer for ${pdfFile}: ${e}`);
        }
    }
    openTab(sourceFile, respectOutDir = true, sideColumn = true) {
        const url = this.checkViewer(sourceFile, respectOutDir);
        if (!url) {
            return;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile, respectOutDir);
        this.clients[pdfFile.toLocaleUpperCase()] = this.clients[pdfFile.toLocaleUpperCase()] || [];
        const uri = vscode.Uri.file(pdfFile).with({ scheme: 'latex-workshop-pdf' });
        const editor = vscode.window.activeTextEditor;
        const panel = vscode.window.createWebviewPanel('latex-workshop-pdf', path.basename(pdfFile), sideColumn ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getPDFViewerContent(uri);
        if (editor) {
            vscode.window.showTextDocument(editor.document, editor.viewColumn);
        }
        this.extension.logger.addLogMessage(`Open PDF tab for ${pdfFile}`);
    }
    getPDFViewerContent(uri) {
        // pdfjs viewer automatically call decodeURIComponent.
        // So, to pass the encoded path of a pdf file to the http server,
        // we have to call encodeURIComponent two times! 2 - 1 = 1 !
        const url = `http://${this.extension.server.address}/viewer.html?incode=1&file=/pdf:${uri.authority ? `\\\\${uri.authority}` : ''}${encodeURIComponent(encodeURIComponent(uri.fsPath))}`;
        return `
            <!DOCTYPE html><html><head></head>
            <body><iframe id="preview-panel" class="preview-panel" src="${url}" style="position:absolute; border: none; left: 0; top: 0; width: 100%; height: 100%;">
            </iframe>
            <script>
            // when the iframe loads, or when the tab gets focus again later, move the
            // the focus to the iframe so that keyboard navigation works in the pdf.
            //
            // Note: this works on first load, or when navigating between groups, but not when
            //       navigating between tabs of the same group for some reason!

            let iframe = document.getElementById('preview-panel');
            window.onfocus = iframe.onload = function() {
                setTimeout(function() { // doesn't work immediately
                    iframe.contentWindow.focus();
                }, 100);
            }
            </script>
            </body></html>
        `;
    }
    openExternal(sourceFile) {
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        let command = JSON.parse(JSON.stringify(configuration.get('view.pdf.external.command')));
        if (!command.command) {
            switch (process.platform) {
                case 'win32':
                    command = { 'command': 'SumatraPDF.exe', 'args': ['%PDF%'] };
                    break;
                case 'linux':
                    command = { 'command': 'xdg-open', 'args': ['%PDF%'] };
                    break;
                case 'darwin':
                    command = { 'command': 'open', 'args': ['%PDF%'] };
                    break;
                default:
                    break;
            }
        }
        if (command.args) {
            command.args = command.args.map(arg => arg.replace('%PDF%', pdfFile));
        }
        this.extension.manager.setEnvVar();
        cp.spawn(command.command, command.args, { cwd: path.dirname(sourceFile), detached: true });
        this.extension.logger.addLogMessage(`Open external viewer for ${pdfFile}`);
    }
    handler(websocket, msg) {
        const data = JSON.parse(msg);
        let clients;
        switch (data.type) {
            case 'open':
                clients = this.clients[decodeURIComponent(decodeURIComponent(data.path)).toLocaleUpperCase()];
                if (clients === undefined) {
                    return;
                }
                clients.push({
                    viewer: data.viewer,
                    websocket
                });
                break;
            case 'close':
                for (const key in this.clients) {
                    clients = this.clients[key];
                    let index = -1;
                    for (const client of clients) {
                        if (client.websocket === websocket) {
                            index = clients.indexOf(client);
                            break;
                        }
                    }
                    if (index > -1) {
                        clients.splice(index, 1);
                    }
                }
                break;
            case 'position':
                clients = this.clients[decodeURIComponent(decodeURIComponent(data.path)).toLocaleUpperCase()];
                for (const client of clients) {
                    if (client.websocket === websocket) {
                        client.position = data;
                    }
                }
                break;
            case 'loaded':
                clients = this.clients[decodeURIComponent(decodeURIComponent(data.path)).toLocaleUpperCase()];
                for (const client of clients) {
                    if (client.websocket !== websocket) {
                        continue;
                    }
                    const configuration = vscode.workspace.getConfiguration('latex-workshop');
                    if (client.position !== undefined) {
                        client.websocket.send(JSON.stringify(client.position));
                    }
                    else {
                        client.websocket.send(JSON.stringify({
                            type: 'params',
                            scale: configuration.get('view.pdf.zoom'),
                            scrollMode: configuration.get('view.pdf.scrollMode'),
                            spreadMode: configuration.get('view.pdf.spreadMode'),
                            hand: configuration.get('view.pdf.hand'),
                            invert: configuration.get('view.pdf.invert'),
                        }));
                    }
                    if (configuration.get('synctex.afterBuild.enabled')) {
                        this.extension.locator.syncTeX();
                    }
                }
                break;
            case 'click':
                this.extension.locator.locate(data, decodeURIComponent(data.path));
                break;
            case 'external_link':
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(data.url));
                break;
            default:
                this.extension.logger.addLogMessage(`Unknown websocket message: ${msg}`);
                break;
        }
    }
    syncTeX(pdfFile, record) {
        const clients = this.clients[pdfFile.toLocaleUpperCase()];
        if (clients === undefined) {
            this.extension.logger.addLogMessage(`PDF is not viewed: ${pdfFile}`);
            return;
        }
        for (const client of clients) {
            client.websocket.send(JSON.stringify({ type: 'synctex', data: record }));
            this.extension.logger.addLogMessage(`Try to synctex ${pdfFile}`);
        }
    }
}
exports.Viewer = Viewer;
//# sourceMappingURL=viewer.js.map