const vscode = require('vscode');
const { controllers } = require('tondev');
const snippets_json = require("./snippets/ton-solidity.json");
const path = require('path');
const { getErrors } = require('./utils');

const wordsSet = snippets_json['.source.ton-solidity'];

let _tondevTerminal;
let t_out;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ton-solidity" is now active!');
	disposable = vscode.languages.registerHoverProvider('ton-solidity', {
		provideHover(document, position) {
			const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z\.]{1,30}/);
			const word = document.getText(wordRange);			
			let suggestion = null;
			for (const [, value] of Object.entries(wordsSet)) {
				if (word.includes(value.prefix)){
					if (Array.isArray(value.description)) {
						suggestion = value.description.join("\n")
					} else {
						suggestion = value.description;
					}
					break;
				}					
			}
			return new vscode.Hover(suggestion);
		}
	});

	context.subscriptions.push(disposable);

	const collection = vscode.languages.createDiagnosticCollection("tonsol");

	if (vscode.window.activeTextEditor) {
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
	t_out = [];
	_tondevTerminal = null;
	let filePath = document.uri.fsPath;
	if (path.extname(document.uri.fsPath) !== '.sol') {
		return;
	}
	const compileCommand = controllers[1].commands[1];
	let args = [];
	args['file'] = filePath;
	args['output'] = '';
	runCommand(compileCommand, args).then( r => {
		let collectionSet = r.map(value => {	
			return {
				code: '',
				message: value.info,
				range: new vscode.Range(new vscode.Position(value.coord.raw-1, value.coord.position-1), new vscode.Position(value.coord.raw-1, value.coord.position + value.errorLenght-1)),
				severity: value.severity == 'Error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
				source: '',
				relatedInformation: [
					new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(value.coord.raw, value.coord.position-1), new vscode.Position(value.coord.raw-1, value.coord.position + value.errorLenght-1))), value.info)
				]
			}
		})
		collection.set(document.uri, collectionSet);		
	})
}

async function runCommand(command, args) {
	const terminal = tondevTerminal();
	try {
		await command.run(tondevTerminal(), args);
	} catch (err) {
		terminal.writeError(err.toString());
	}
	return getErrors(t_out[0]);
}

function tondevTerminal() {
	if (!_tondevTerminal) {
		const output = vscode.window.createOutputChannel("TONDev");
		_tondevTerminal = {
			output,
			log: (...args) => {
				output.appendLine(args.map((x) => `${x}`).join(""));
			},
			writeError: (text) => {
				t_out.push(text);				
			},
			write: (text) => {
				t_out.push(text);				
			},
		};		
	}
	return _tondevTerminal;
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
