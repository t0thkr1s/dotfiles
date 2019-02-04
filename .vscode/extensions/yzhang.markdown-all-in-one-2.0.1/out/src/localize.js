"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class Localize {
    constructor(config = {}) {
        this.config = config;
        // get language pack when the instance be created
        this.bundle = this.resolveLanguagePack();
    }
    /**
     * translate the key
     * @param key
     * @param args
     */
    localize(key, ...args) {
        const languagePack = this.bundle;
        const message = languagePack[key] || key;
        return this.format(message, args);
    }
    /**
     * format the message
     * @param message
     * @param args
     */
    format(message, args = []) {
        let result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, (match, rest) => {
                const index = rest[0];
                return typeof args[index] !== "undefined" ? args[index] : match;
            });
        }
        return result;
    }
    /**
     * Get language pack
     */
    resolveLanguagePack() {
        let resolvedLanguage = "";
        // TODO: it should read the extension root path from context
        const rootPath = path.join(__dirname, "..", "..");
        const file = path.join(rootPath, "package");
        const options = this.config;
        if (!options.locale) {
            resolvedLanguage = ".nls.json";
        }
        else {
            let locale = options.locale;
            while (locale) {
                const candidate = ".nls." + locale + ".json";
                if (fs.existsSync(file + candidate)) {
                    resolvedLanguage = candidate;
                    break;
                }
                else {
                    const index = locale.lastIndexOf("-");
                    if (index > 0) {
                        locale = locale.substring(0, index);
                    }
                    else {
                        resolvedLanguage = ".nls.json";
                        locale = null;
                    }
                }
            }
        }
        const languageFilePath = path.join(file + resolvedLanguage);
        if (!fs.existsSync(languageFilePath)) {
            return {};
        }
        return require(languageFilePath);
    }
}
exports.Localize = Localize;
let config = {
    locale: "en"
};
try {
    config = Object.assign(config, JSON.parse(process.env.VSCODE_NLS_CONFIG));
}
catch (err) {
    //
}
const instance = new Localize(config);
exports.default = instance.localize.bind(instance);
//# sourceMappingURL=localize.js.map