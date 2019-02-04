"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path = require("path");
const child_process = require("child_process");
var logger;
var options;
// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
function activate(ctx) {
    options = new Options();
    logger = new Logger('info');
    let wakatime = new WakaTime();
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.apikey', function (args) {
        wakatime.promptForApiKey();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.proxy', function (args) {
        wakatime.promptForProxy();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.debug', function (args) {
        wakatime.promptForDebug();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.status_bar_icon', function (args) {
        wakatime.promptStatusBarIcon();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.dashboard', function (args) {
        wakatime.openDashboardWebsite();
    }));
    // dispose WakaTime instance when this extension is deactivated
    ctx.subscriptions.push(wakatime);
    options.getSetting('settings', 'debug', function (error, debug) {
        if (debug && debug.trim() === 'true')
            logger.setLevel('debug');
        wakatime.initialize();
    });
}
exports.activate = activate;
class WakaTime {
    constructor() {
        this.appNames = {
            'SQL Operations Studio': 'sqlops',
            'Visual Studio Code': 'vscode',
        };
        this.extension = vscode.extensions.getExtension('WakaTime.vscode-wakatime').packageJSON;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.lastHeartbeat = 0;
        this.options = new Options();
    }
    initialize() {
        logger.debug('Initializing WakaTime v' + this.extension.version);
        this.agentName = this.appNames[vscode.env.appName] || 'vscode';
        this.statusBar.text = '$(clock) WakaTime Initializing...';
        this.statusBar.show();
        this.checkApiKey();
        this.dependencies = new Dependencies(this.options);
        this.dependencies.checkAndInstall(() => {
            this.statusBar.text = '$(clock)';
            this.statusBar.tooltip = 'WakaTime: Initialized';
            this.options.getSetting('settings', 'status_bar_icon', (err, val) => {
                if (val && val.trim() == 'false')
                    this.statusBar.hide();
                else
                    this.statusBar.show();
            });
        });
        this.setupEventListeners();
    }
    promptForApiKey() {
        this.options.getSetting('settings', 'api_key', (err, defaultVal) => {
            if (this.validateKey(defaultVal) != null)
                defaultVal = '';
            let promptOptions = {
                prompt: 'WakaTime API Key',
                placeHolder: 'Enter your api key from wakatime.com/settings',
                value: defaultVal,
                ignoreFocusOut: true,
                validateInput: this.validateKey.bind(this),
            };
            vscode.window.showInputBox(promptOptions).then(val => {
                if (this.validateKey(val) == null)
                    this.options.setSetting('settings', 'api_key', val);
            });
        });
    }
    promptForProxy() {
        this.options.getSetting('settings', 'proxy', (err, defaultVal) => {
            if (!defaultVal)
                defaultVal = '';
            let promptOptions = {
                prompt: 'WakaTime Proxy',
                placeHolder: 'Proxy format is https://user:pass@host:port',
                value: defaultVal,
                ignoreFocusOut: true,
                validateInput: this.validateProxy.bind(this),
            };
            vscode.window.showInputBox(promptOptions).then(val => {
                if (val || val === '')
                    this.options.setSetting('settings', 'proxy', val);
            });
        });
    }
    promptForDebug() {
        this.options.getSetting('settings', 'debug', (err, defaultVal) => {
            if (!defaultVal || defaultVal.trim() !== 'true')
                defaultVal = 'false';
            let items = ['true', 'false'];
            let promptOptions = {
                placeHolder: 'true or false (Currently ' + defaultVal + ')',
                value: defaultVal,
                ignoreFocusOut: true,
            };
            vscode.window.showQuickPick(items, promptOptions).then(newVal => {
                if (newVal == null)
                    return;
                this.options.setSetting('settings', 'debug', newVal);
                if (newVal === 'true') {
                    logger.setLevel('debug');
                    logger.debug('Debug enabled');
                }
                else {
                    logger.setLevel('info');
                }
            });
        });
    }
    promptStatusBarIcon() {
        this.options.getSetting('settings', 'status_bar_icon', (err, defaultVal) => {
            if (!defaultVal || defaultVal.trim() !== 'false')
                defaultVal = 'true';
            let items = ['true', 'false'];
            let promptOptions = {
                placeHolder: 'true or false (Currently ' + defaultVal + ')',
                value: defaultVal,
                ignoreFocusOut: true,
            };
            vscode.window.showQuickPick(items, promptOptions).then(newVal => {
                if (newVal == null)
                    return;
                this.options.setSetting('settings', 'status_bar_icon', newVal);
                if (newVal === 'true') {
                    this.statusBar.show();
                    logger.debug('Status bar icon enabled');
                }
                else {
                    this.statusBar.hide();
                    logger.debug('Status bar icon disabled');
                }
            });
        });
    }
    openDashboardWebsite() {
        let open = 'xdg-open';
        let args = ['https://wakatime.com/'];
        if (Dependencies.isWindows()) {
            open = 'cmd';
            args.unshift('/c', 'start', '""');
        }
        else if (os.type() == 'Darwin') {
            open = 'open';
        }
        let process = child_process.execFile(open, args, (error, stdout, stderr) => {
            if (error != null) {
                if (stderr && stderr.toString() != '')
                    logger.error(stderr.toString());
                if (stdout && stdout.toString() != '')
                    logger.error(stdout.toString());
                logger.error(error.toString());
            }
        });
    }
    dispose() {
        this.statusBar.dispose();
        this.disposable.dispose();
    }
    validateKey(key) {
        const err = 'Invalid api key... check https://wakatime.com/settings for your key.';
        if (!key)
            return err;
        const re = new RegExp('^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$', 'i');
        if (!re.test(key))
            return err;
        return null;
    }
    validateProxy(proxy) {
        const err = 'Invalid proxy. Valid formats are https://user:pass@host:port or socks5://user:pass@host:port or domain\\user:pass.';
        if (!proxy)
            return err;
        let re = new RegExp('^((https?|socks5)://)?([^:@]+(:([^:@])+)?@)?[\\w\\.-]+(:\\d+)?$', 'i');
        if (proxy.indexOf('\\') > -1)
            re = new RegExp('^.*\\\\.+$', 'i');
        if (!re.test(proxy))
            return err;
        return null;
    }
    checkApiKey() {
        this.hasApiKey(hasApiKey => {
            if (!hasApiKey)
                this.promptForApiKey();
        });
    }
    hasApiKey(callback) {
        this.options.getSetting('settings', 'api_key', (error, apiKey) => {
            callback(this.validateKey(apiKey) == null);
        });
    }
    setupEventListeners() {
        // subscribe to selection change and editor activation events
        let subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this.onChange, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onChange, this, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.onSave, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
    }
    onChange() {
        this.onEvent(false);
    }
    onSave() {
        this.onEvent(true);
    }
    onEvent(isWrite) {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let doc = editor.document;
            if (doc) {
                let file = doc.fileName;
                if (file) {
                    let time = Date.now();
                    if (isWrite || this.enoughTimePassed(time) || this.lastFile !== file) {
                        this.sendHeartbeat(file, isWrite);
                        this.lastFile = file;
                        this.lastHeartbeat = time;
                    }
                }
            }
        }
    }
    sendHeartbeat(file, isWrite) {
        this.hasApiKey(hasApiKey => {
            if (hasApiKey) {
                this.dependencies.getPythonLocation(pythonBinary => {
                    if (pythonBinary) {
                        let core = this.dependencies.getCoreLocation();
                        let user_agent = this.agentName + '/' + vscode.version + ' vscode-wakatime/' + this.extension.version;
                        let args = [core, '--file', quote(file), '--plugin', quote(user_agent)];
                        let project = this.getProjectName(file);
                        if (project)
                            args.push('--alternate-project', quote(project));
                        if (isWrite)
                            args.push('--write');
                        if (Dependencies.isWindows()) {
                            args.push('--config', quote(this.options.getConfigFile()), '--logfile', quote(this.options.getLogFile()));
                        }
                        logger.debug('Sending heartbeat: ' + this.formatArguments(pythonBinary, args));
                        let process = child_process.execFile(pythonBinary, args, (error, stdout, stderr) => {
                            if (error != null) {
                                if (stderr && stderr.toString() != '')
                                    logger.error(stderr.toString());
                                if (stdout && stdout.toString() != '')
                                    logger.error(stdout.toString());
                                logger.error(error.toString());
                            }
                        });
                        process.on('close', (code, signal) => {
                            if (code == 0) {
                                this.statusBar.text = '$(clock)';
                                let today = new Date();
                                this.statusBar.tooltip = 'WakaTime: Last heartbeat sent ' + this.formatDate(today);
                            }
                            else if (code == 102) {
                                this.statusBar.text = '$(clock)';
                                this.statusBar.tooltip =
                                    'WakaTime: Working offline... coding activity will sync next time we are online.';
                                logger.warn('API Error (102); Check your ' + options.getLogFile() + ' file for more details.');
                            }
                            else if (code == 103) {
                                this.statusBar.text = '$(clock) WakaTime Error';
                                let error_msg = 'Config Parsing Error (103); Check your ' +
                                    options.getLogFile() +
                                    ' file for more details.';
                                this.statusBar.tooltip = 'WakaTime: ' + error_msg;
                                logger.error(error_msg);
                            }
                            else if (code == 104) {
                                this.statusBar.text = '$(clock) WakaTime Error';
                                let error_msg = 'Invalid API Key (104); Make sure your API Key is correct!';
                                this.statusBar.tooltip = 'WakaTime: ' + error_msg;
                                logger.error(error_msg);
                            }
                            else {
                                this.statusBar.text = '$(clock) WakaTime Error';
                                let error_msg = 'Unknown Error (' +
                                    code +
                                    '); Check your ' +
                                    options.getLogFile() +
                                    ' file for more details.';
                                this.statusBar.tooltip = 'WakaTime: ' + error_msg;
                                logger.error(error_msg);
                            }
                        });
                    }
                });
            }
            else {
                this.promptForApiKey();
            }
        });
    }
    formatDate(date) {
        let months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        let ampm = 'AM';
        let hour = date.getHours();
        if (hour > 11) {
            ampm = 'PM';
            hour = hour - 12;
        }
        if (hour == 0) {
            hour = 12;
        }
        let minute = date.getMinutes();
        return (months[date.getMonth()] +
            ' ' +
            date.getDate() +
            ', ' +
            date.getFullYear() +
            ' ' +
            hour +
            ':' +
            (minute < 10 ? '0' + minute : minute) +
            ' ' +
            ampm);
    }
    enoughTimePassed(time) {
        return this.lastHeartbeat + 120000 < time;
    }
    getProjectName(file) {
        let uri = vscode.Uri.file(file);
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (vscode.workspace && workspaceFolder) {
            try {
                return workspaceFolder.name;
            }
            catch (e) { }
        }
        return null;
    }
    obfuscateKey(key) {
        let newKey = '';
        if (key) {
            newKey = key;
            if (key.length > 4)
                newKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX' + key.substring(key.length - 4);
        }
        return newKey;
    }
    wrapArg(arg) {
        if (arg.indexOf(' ') > -1)
            return '"' + arg.replace(/"/g, '\\"') + '"';
        return arg;
    }
    formatArguments(python, args) {
        let clone = args.slice(0);
        clone.unshift(this.wrapArg(python));
        let newCmds = [];
        let lastCmd = '';
        for (let i = 0; i < clone.length; i++) {
            if (lastCmd == '--key')
                newCmds.push(this.wrapArg(this.obfuscateKey(clone[i])));
            else
                newCmds.push(this.wrapArg(clone[i]));
            lastCmd = clone[i];
        }
        return newCmds.join(' ');
    }
}
exports.WakaTime = WakaTime;
class Dependencies {
    constructor(options) {
        this.dirname = __dirname;
        this.options = options;
    }
    checkAndInstall(callback) {
        this.isPythonInstalled(isInstalled => {
            if (!isInstalled) {
                this.installPython(() => {
                    this.checkAndInstallCore(callback);
                });
            }
            else {
                this.checkAndInstallCore(callback);
            }
        });
    }
    checkAndInstallCore(callback) {
        if (!this.isCoreInstalled()) {
            this.installCore(callback);
        }
        else {
            this.isCoreLatest(isLatest => {
                if (!isLatest) {
                    this.installCore(callback);
                }
                else {
                    callback();
                }
            });
        }
    }
    getPythonLocation(callback) {
        if (this.cachedPythonLocation)
            return callback(this.cachedPythonLocation);
        let locations = [
            this.dirname + path.sep + 'python' + path.sep + 'pythonw',
            'python3',
            'pythonw',
            'python',
            '/usr/local/bin/python3',
            '/usr/local/bin/python',
            '/usr/bin/python3',
            '/usr/bin/python',
        ];
        for (var i = 39; i >= 27; i--) {
            if (i >= 30 && i <= 32)
                continue;
            locations.push('\\python' + i + '\\pythonw');
            locations.push('\\Python' + i + '\\pythonw');
        }
        this.findPython(locations, python => {
            if (python)
                this.cachedPythonLocation = python;
            callback(python);
        });
    }
    getCoreLocation() {
        let dir = this.dirname + path.sep + 'wakatime-master' + path.sep + 'wakatime' + path.sep + 'cli.py';
        return dir;
    }
    static isWindows() {
        return os.type() === 'Windows_NT';
    }
    findPython(locations, callback) {
        const binary = locations.shift();
        if (!binary) {
            callback(null);
            return;
        }
        logger.debug('Looking for python at: ' + binary);
        const args = ['--version'];
        child_process.execFile(binary, args, (error, stdout, stderr) => {
            const output = stdout.toString() + stderr.toString();
            if (!error && this.isSupportedPythonVersion(binary, output)) {
                this.cachedPythonLocation = binary;
                logger.debug('Valid python version: ' + output);
                callback(binary);
            }
            else {
                logger.debug('Invalid python version: ' + output);
                this.findPython(locations, callback);
            }
        });
    }
    isCoreInstalled() {
        return fs.existsSync(this.getCoreLocation());
    }
    isCoreLatest(callback) {
        this.getPythonLocation(pythonBinary => {
            if (pythonBinary) {
                let args = [this.getCoreLocation(), '--version'];
                child_process.execFile(pythonBinary, args, (error, stdout, stderr) => {
                    if (!(error != null)) {
                        let currentVersion = stderr.toString().trim();
                        logger.debug('Current wakatime-core version is ' + currentVersion);
                        logger.debug('Checking for updates to wakatime-core...');
                        this.getLatestCoreVersion(latestVersion => {
                            if (currentVersion === latestVersion) {
                                logger.debug('wakatime-core is up to date.');
                                if (callback)
                                    callback(true);
                            }
                            else if (latestVersion) {
                                logger.debug('Found an updated wakatime-core v' + latestVersion);
                                if (callback)
                                    callback(false);
                            }
                            else {
                                logger.debug('Unable to find latest wakatime-core version from GitHub.');
                                if (callback)
                                    callback(false);
                            }
                        });
                    }
                    else {
                        if (callback)
                            callback(false);
                    }
                });
            }
            else {
                if (callback)
                    callback(false);
            }
        });
    }
    getLatestCoreVersion(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = 'https://raw.githubusercontent.com/wakatime/wakatime/master/wakatime/__about__.py';
            const request = yield Promise.resolve().then(() => require('request'));
            this.options.getSetting('settings', 'proxy', function (err, proxy) {
                let options = { url: url };
                if (proxy && proxy.trim())
                    options['proxy'] = proxy.trim();
                request.get(options, function (error, response, body) {
                    let version = null;
                    if (!error && response.statusCode == 200) {
                        let lines = body.split('\n');
                        for (var i = 0; i < lines.length; i++) {
                            let re = /^__version_info__ = \('([0-9]+)', '([0-9]+)', '([0-9]+)'\)/g;
                            let match = re.exec(lines[i]);
                            if (match) {
                                version = match[1] + '.' + match[2] + '.' + match[3];
                                if (callback)
                                    return callback(version);
                            }
                        }
                    }
                    if (callback)
                        return callback(version);
                });
            });
        });
    }
    installCore(callback) {
        logger.debug('Downloading wakatime-core...');
        let url = 'https://github.com/wakatime/wakatime/archive/master.zip';
        let zipFile = this.dirname + path.sep + 'wakatime-master.zip';
        this.downloadFile(url, zipFile, () => {
            this.extractCore(zipFile, callback);
        });
    }
    extractCore(zipFile, callback) {
        logger.debug('Extracting wakatime-core into "' + this.dirname + '"...');
        this.removeCore(() => {
            this.unzip(zipFile, this.dirname, callback);
            logger.debug('Finished extracting wakatime-core.');
        });
    }
    removeCore(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(this.dirname + path.sep + 'wakatime-master')) {
                try {
                    const rimraf = yield Promise.resolve().then(() => require('rimraf'));
                    rimraf(this.dirname + path.sep + 'wakatime-master', () => {
                        if (callback != null) {
                            return callback();
                        }
                    });
                }
                catch (e) {
                    logger.warn(e);
                }
            }
            else {
                if (callback != null) {
                    return callback();
                }
            }
        });
    }
    downloadFile(url, outputFile, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield Promise.resolve().then(() => require('request'));
            this.options.getSetting('settings', 'proxy', function (err, proxy) {
                let options = { url: url };
                if (proxy && proxy.trim())
                    options['proxy'] = proxy.trim();
                let r = request.get(options);
                let out = fs.createWriteStream(outputFile);
                r.pipe(out);
                return r.on('end', function () {
                    return out.on('finish', function () {
                        if (callback != null) {
                            return callback();
                        }
                    });
                });
            });
        });
    }
    unzip(file, outputDir, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(file)) {
                try {
                    const AdmZip = yield Promise.resolve().then(() => require('adm-zip'));
                    let zip = new AdmZip(file);
                    zip.extractAllTo(outputDir, true);
                }
                catch (e) {
                    return logger.error(e);
                }
                finally {
                    fs.unlink(file, unlinkError => {
                        if (callback) {
                            return callback();
                        }
                    });
                }
            }
        });
    }
    isPythonInstalled(callback) {
        this.getPythonLocation(pythonBinary => {
            callback(!!pythonBinary);
        });
    }
    installPython(callback) {
        if (Dependencies.isWindows()) {
            let ver = '3.5.1';
            let arch = 'win32';
            if (os.arch().indexOf('x64') > -1)
                arch = 'amd64';
            let url = 'https://www.python.org/ftp/python/' + ver + '/python-' + ver + '-embed-' + arch + '.zip';
            logger.debug('Downloading python...');
            let zipFile = this.dirname + path.sep + 'python.zip';
            this.downloadFile(url, zipFile, () => {
                logger.debug('Extracting python...');
                this.unzip(zipFile, this.dirname + path.sep + 'python');
                logger.debug('Finished installing python.');
                callback();
            });
        }
        else {
            logger.error('WakaTime depends on Python. Install it from https://python.org/downloads then restart VSCode.');
            // window.alert('WakaTime depends on Python. Install it from https://python.org/downloads then restart VSCode.');
        }
    }
    isSupportedPythonVersion(binary, versionString) {
        // Only support Python 2.7+ because 2.6 has SSL problems
        if (binary.toLowerCase().includes('python26'))
            return false;
        const anaconda = /continuum|anaconda/gi;
        const isAnaconda = !!anaconda.test(versionString);
        const re = /python\s+(\d+)\.(\d+)\.(\d+)\s/gi;
        const ver = re.exec(versionString);
        if (!ver)
            return !isAnaconda;
        // Older Ananconda python distributions not supported
        if (isAnaconda) {
            if (parseInt(ver[1]) >= 3 && parseInt(ver[2]) >= 5)
                return true;
        }
        else {
            // Only support Python 2.7+ because 2.6 has SSL problems
            if (parseInt(ver[1]) >= 2 || parseInt(ver[2]) >= 7)
                return true;
        }
        return false;
    }
}
class Options {
    constructor() {
        this.configFile = path.join(this.getWakaHome(), '.wakatime.cfg');
        this.logFile = path.join(this.getWakaHome(), '.wakatime.log');
    }
    getWakaHome() {
        let home = process.env.WAKATIME_HOME;
        if (home) {
            return home;
        }
        else {
            return this.getUserHomeDir();
        }
    }
    getSetting(section, key, callback) {
        fs.readFile(this.getConfigFile(), 'utf-8', (err, content) => {
            if (err) {
                if (callback)
                    callback(new Error('could not read ' + this.getConfigFile()), null);
            }
            else {
                let currentSection = '';
                let lines = content.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    if (this.startsWith(line.trim(), '[') && this.endsWith(line.trim(), ']')) {
                        currentSection = line
                            .trim()
                            .substring(1, line.trim().length - 1)
                            .toLowerCase();
                    }
                    else if (currentSection === section) {
                        let parts = line.split('=');
                        let currentKey = parts[0].trim();
                        if (currentKey === key && parts.length > 1) {
                            if (callback)
                                callback(null, parts[1].trim());
                            return;
                        }
                    }
                }
                if (callback)
                    callback(null, null);
            }
        });
    }
    setSetting(section, key, val, callback) {
        fs.readFile(this.getConfigFile(), 'utf-8', (err, content) => {
            // ignore errors because config file might not exist yet
            if (err)
                content = '';
            let contents = [];
            let currentSection = '';
            let found = false;
            let lines = content.split('\n');
            for (var i = 0; i < lines.length; i++) {
                let line = lines[i];
                if (this.startsWith(line.trim(), '[') && this.endsWith(line.trim(), ']')) {
                    if (currentSection === section && !found) {
                        contents.push(key + ' = ' + val);
                        found = true;
                    }
                    currentSection = line
                        .trim()
                        .substring(1, line.trim().length - 1)
                        .toLowerCase();
                    contents.push(line);
                }
                else if (currentSection === section) {
                    let parts = line.split('=');
                    let currentKey = parts[0].trim();
                    if (currentKey === key) {
                        if (!found) {
                            contents.push(key + ' = ' + val);
                            found = true;
                        }
                    }
                    else {
                        contents.push(line);
                    }
                }
                else {
                    contents.push(line);
                }
            }
            if (!found) {
                if (currentSection !== section) {
                    contents.push('[' + section + ']');
                }
                contents.push(key + ' = ' + val);
            }
            fs.writeFile(this.getConfigFile(), contents.join('\n'), function (err2) {
                if (err) {
                    if (callback)
                        callback(new Error('could not write to ' + this.getConfigFile()));
                }
                else {
                    if (callback)
                        callback(null);
                }
            });
        });
    }
    getConfigFile() {
        return this.configFile;
    }
    getLogFile() {
        return this.logFile;
    }
    getUserHomeDir() {
        return process.env[Dependencies.isWindows() ? 'USERPROFILE' : 'HOME'] || '';
    }
    startsWith(outer, inner) {
        return outer.slice(0, inner.length) === inner;
    }
    endsWith(outer, inner) {
        return inner === '' || outer.slice(-inner.length) === inner;
    }
}
class Logger {
    constructor(level) {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.setLevel(level);
    }
    setLevel(level) {
        if (level in this.levels) {
            this.level = level;
        }
        else {
            throw new TypeError('Invalid level: ' + level);
        }
    }
    log(level, msg) {
        if (!(level in this.levels))
            throw new TypeError('Invalid level: ' + level);
        const current = this.levels[level];
        const cutoff = this.levels[this.level];
        if (current >= cutoff) {
            msg = '[WakaTime] [' + level.toUpperCase() + '] ' + msg;
            if (level == 'debug')
                console.log(msg);
            if (level == 'info')
                console.info(msg);
            if (level == 'warn')
                console.warn(msg);
            if (level == 'error')
                console.error(msg);
        }
    }
    debug(msg) {
        this.log('debug', msg);
    }
    info(msg) {
        this.log('info', msg);
    }
    warn(msg) {
        this.log('warn', msg);
    }
    error(msg) {
        this.log('error', msg);
    }
}
function quote(str) {
    if (str.includes(' '))
        return '"' + str.replace('"', '\\"') + '"';
    return str;
}
//# sourceMappingURL=extension.js.map