'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const completion = require("./completion");
const formatting = require("./formatting");
const listEditing = require("./listEditing");
const localize_1 = require("./localize");
const preview = require("./preview");
const print = require("./print");
const decorations = require("./syntaxDecorations");
const tableFormatter = require("./tableFormatter");
const toc = require("./toc");
const util_1 = require("./util");
function activate(context) {
    activateMdExt(context);
    return {
        extendMarkdownIt(md) {
            return md.use(require('markdown-it-task-lists'))
                .use(require('@neilsustc/markdown-it-katex'), { "throwOnError": false });
        }
    };
}
exports.activate = activate;
function activateMdExt(context) {
    // Override `Enter`, `Tab` and `Backspace` keys
    listEditing.activate(context);
    // Shortcuts
    formatting.activate(context);
    // Toc
    toc.activate(context);
    // Syntax decorations
    decorations.activiate(context);
    // Images paths and math commands completions
    completion.activate(context);
    // Print to PDF
    print.activate(context);
    // Table formatter
    if (vscode_1.workspace.getConfiguration('markdown.extension.tableFormatter').get('enabled')) {
        tableFormatter.activate(context);
    }
    // Auto show preview to side
    preview.activate(context);
    // Allow `*` in word pattern for quick styling
    vscode_1.languages.setLanguageConfiguration('markdown', {
        wordPattern: /(-?\d*\.\d\w*)|([^\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s\，\。\《\》\？\；\：\‘\“\’\”\（\）\【\】\、]+)/g
    });
    newVersionMessage(context.extensionPath);
}
function newVersionMessage(extensionPath) {
    let data, currentVersion;
    try {
        data = fs.readFileSync(`${extensionPath}${path.sep}package.json`).toString();
        currentVersion = JSON.parse(data).version;
        if (fs.existsSync(`${extensionPath}${path.sep}VERSION`)
            && fs.readFileSync(`${extensionPath}${path.sep}VERSION`).toString() === currentVersion) {
            return;
        }
        fs.writeFileSync(`${extensionPath}${path.sep}VERSION`, currentVersion);
    }
    catch (error) {
        console.log(error);
        return;
    }
    const featureMsg = util_1.getNewFeatureMsg(currentVersion);
    if (featureMsg === undefined)
        return;
    const message1 = localize_1.default("showMe");
    const message2 = localize_1.default("dismiss");
    vscode_1.window.showInformationMessage(featureMsg, message1, message2).then(option => {
        switch (option) {
            case message1:
                util_1.showChangelog();
            case message2:
                break;
        }
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map