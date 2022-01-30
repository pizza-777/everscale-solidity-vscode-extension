const vscode = require('vscode');
const { controllers } = require('everdev');
const path = require('path');
const { getErrors, getHoverItems, getSnippetItems, getSignatures } = require('./utils');
const { setLanguageMode } = require("./languageMode")

let _tondevTerminal;
let t_out;
const MODE = { scheme: 'file', language: 'ton-solidity' }
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	const signatureProvider = vscode.languages.registerSignatureHelpProvider(
		MODE,
		{
			provideSignatureHelp(document, position,) {
				return getSignatures(document, position);
			}
		},
		'(',
		','
	);
	context.subscriptions.push(signatureProvider);
	const completionProvider = vscode.languages.registerCompletionItemProvider(
		MODE,
		{
			provideCompletionItems(document, position) {
				return getSnippetItems(document, position);
			}
		},
		''
	);
	context.subscriptions.push(completionProvider);

	let hoverProvider = vscode.languages.registerHoverProvider(
		MODE,
		{
			provideHover(document, position) {
				const wordRange = document.getWordRangeAtPosition(position, /[_a-zA-Z0-9\.]{1,100}/);
				if (typeof wordRange == 'undefined') return;
				const word = document.getText(wordRange);
				return new vscode.Hover(getHoverItems(word, document));
			}
		});

	context.subscriptions.push(hoverProvider);

	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((document) => {
		if (document.languageId == MODE.language) collection.set(document.uri, null);
	}));

	const collection = vscode.languages.createDiagnosticCollection("tonsol");

	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document, collection)
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		setLanguageMode();
		if (editor) {
			updateDiagnostics(editor.document, collection);
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async documentChangeEvent => {
		if (documentChangeEvent) {
			updateDiagnostics(documentChangeEvent.document, collection);
		}
	}));
}


async function updateDiagnostics(document, collection) {
	if (document.languageId != MODE.language) return;
	collection.clear();
	vscode.workspace.saveAll();
	t_out = [];
	_tondevTerminal = null;
	let filePath = document.uri.fsPath;
	if (path.extname(document.uri.fsPath) !== '.sol') {
		return;
	}
	const compileCommand = controllers[1].commands[1];
	let args = [];
	args['file'] = filePath;
	args['outputDir'] = path.resolve(__dirname, 'abi');
	let r = await runCommand(compileCommand, args);

	if (r == undefined) {
		return;
	}
	let collectionSet = r.map(value => {
		let line = Math.abs(value.coord.raw - 1);
		let character = Math.abs(value.coord.position - 1);
		return {
			code: '',
			message: value.info,
			range: new vscode.Range(new vscode.Position(line, character), new vscode.Position(line, character + value.errorLenght)),
			severity: value.severity == 'Error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
			source: value.source.fsPath,
			relatedInformation: [
				new vscode.DiagnosticRelatedInformation(new vscode.Location(value.source, new vscode.Range(new vscode.Position(line, character), new vscode.Position(line, character + value.errorLenght))), null)
			]
		}
	})
	collection.set(document.uri, collectionSet);
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
				!t_out.includes(text) && t_out.push(text);
			},
			write: () => {
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
