const vscode = require('vscode');
const prettier = require("prettier");

const prettierPluginSolidity = require("prettier-plugin-tvmsolidity");
const path = require("path");

function formatter(document, context) {
    const rootPath = getCurrentWorkspaceRootFsPath();
    const ignoreOptions = {
        ignorePath: path.join(rootPath, ".prettierignore"),
    };

    const fileInfo = prettier.getFileInfo.sync(
        document.uri.fsPath,
        ignoreOptions
    );

    if (fileInfo.ignored) {
        return null;
    }

    const options = {
        useCache: false,
        parser: "solidity-parse",
        pluginSearchDirs: [context.extensionPath],
        plugins: [prettierPluginSolidity],
    };

    const config = () => {
        const conf = prettier.resolveConfig.sync(document.uri.fsPath, options);
        if (null !== conf) {
            return conf;
        } else {
            return defaultConfig();
        }
    }
    Object.assign(options, config());
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);
    const content = document.getText();
    let formatted;
    try {
        formatted = prettier.format(content, options);
    } catch (e) {
        console.log(e)
    }
    if(typeof formatted !== 'undefined'){
        return [vscode.TextEdit.replace(new vscode.Range(firstLine.range.start, lastLine.range.end), formatted)]
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

function defaultConfig() {
    return {
        printWidth: 80,
        useTabs: true,
        singleQuote: false,
        bracketSpacing: false,
        explicitTypes: "always",
        overrides: [
            {
                files: "*.sol",
                options: {
                    printWidth: 80,
                    useTabs: true,
                    singleQuote: false,
                    bracketSpacing: false,
                    explicitTypes: "always"
                }
            }
        ]
    }
}

module.exports = {
    formatter
}