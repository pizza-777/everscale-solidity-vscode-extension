// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const snippets_json = require("./snippets/ton-solidity.json")
const wordsSet = snippets_json['.source.ton-solidity'];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ton-solidity" is now active!');
	disposable = vscode.languages.registerHoverProvider('ton-solidity', {
		provideHover(document, position) {
			const wordRange = document.getWordRangeAtPosition(position, new RegExp(/[A-Za-z\.]+/));
			const word = document.getText(wordRange);
			let suggestion = null;
			for (const [, value] of Object.entries(wordsSet)) {
				if (word.includes(value.prefix))
					if (Array.isArray(value.description)) {
						suggestion = value.description.join("\n")
					} else {
						suggestion = value.description;
					}
			}
			return new vscode.Hover(suggestion);
		}
	});

	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
