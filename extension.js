const vscode = require('vscode');
const { controllers } = require('tondev');
const snippets_json = require("./snippets/ton-solidity.json")
const wordsSet = snippets_json['.source.ton-solidity'];


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log(controllers);
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

	const collection = vscode.languages.createDiagnosticCollection("tonsol");

	if(vscode.window.activeTextEditor){
		updateDiagnostics(vscode.window.activeTextEditor.document, collection)
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		console.log('ondidchangetxteditor');
		if (editor) {
			updateDiagnostics(editor.document, collection);
		}
	}));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(documentChangeEvent => {
		 console.log('ondidchangetxtdocument');
		if (documentChangeEvent) {
			updateDiagnostics(documentChangeEvent.document, collection);
		}
	}));

}

function updateDiagnostics(document, collection) {
	console.log(document.uri.fsPath);
	//if (document && path.basename(document.uri.fsPath) === 'sink.sol') {
		collection.set(document.uri, [{
			code: '',
			message: 'cannot assign twice to immutable variable `x`',
			range: new vscode.Range(new vscode.Position(3, 4), new vscode.Position(3, 10)),
			severity: vscode.DiagnosticSeverity.Error,
			source: '',
			relatedInformation: [
				new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), 'first assignment to `x`')
			]
		}]);
	//} else {
	//	collection.clear();
	//}
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
