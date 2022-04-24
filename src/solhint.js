const linter = require('solhint/lib/index');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

configAsJson = {
    "extends": "solhint:all",
    "rules": {
        "max-line-length": ["warn", 100]
    }
}

const getConfig = () => {
    const rootPath = getCurrentWorkspaceRootFsPath();
    if (!rootPath) {
        return configAsJson;
    }
    if (!fs.existsSync(path.join(rootPath, ".solhint.json"))) {
        return configAsJson;
    }
    return require(path.join(rootPath, ".solhint.json"));
}

const hints = (document) => {
    const code = document.getText();
    try {
        const report = linter.processStr(code, getConfig());//todo update config when config file is changed
        return report;
    } catch (e) {
        return;
    }
}

function getCurrentWorkspaceRootFsPath() {
    return getCurrentWorkspaceRootFolder().uri.fsPath;
}

function getCurrentWorkspaceRootFolder() {
    const editor = vscode.window.activeTextEditor;
    const currentDocument = editor.document.uri;

    return vscode.workspace.getWorkspaceFolder(currentDocument);
}

module.exports = {
    hints
}
