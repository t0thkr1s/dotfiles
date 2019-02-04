"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
let binPathCache = {};
function getExecutableFileUnderPath(toolName) {
    let cachePath = binPathCache[toolName];
    if (cachePath) {
        return cachePath;
    }
    toolName = correctBinname(toolName);
    let paths = process.env["PATH"].split(path.delimiter);
    for (let i = 0; i < paths.length; i++) {
        let binpath = path.join(paths[i], toolName);
        if (fileExists(binpath)) {
            binPathCache[toolName] = binpath;
            return binpath;
        }
    }
    return null;
}
exports.getExecutableFileUnderPath = getExecutableFileUnderPath;
function correctBinname(binname) {
    if (process.platform === "win32")
        return binname + ".exe";
    else
        return binname;
}
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (e) {
        return false;
    }
}
exports.fileExists = fileExists;
//# sourceMappingURL=pathUtil.js.map