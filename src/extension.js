const vscode = require('vscode');
const { controllers } = require('everdev');
const path = require('path');
const { getErrors, getHoverItems, getSnippetItems, getSignatures } = require('./utils');
const { setLanguageMode } = require("./languageMode");
const fs = require('fs');
const { astParser } = require("./ast");
const { documentLinks } = require("./documentLinks");
const { formatter } = require("./formatter");

let _tondevTerminal;
let t_out;
const MODE = { scheme: 'file', language: 'ton-solidity' }
let ast;
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	cleanAbiDir();
	setLanguageMode();
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
		['', '.']
	);
	context.subscriptions.push(completionProvider);

	let hoverProvider = vscode.languages.registerHoverProvider(
		MODE,
		{
			provideHover(document, position) {
				const wordRange = document.getWordRangeAtPosition(position, /[_a-zA-Z0-9\.]{1,100}/);
				if (typeof wordRange == 'undefined') return;
				const word = document.getText(wordRange);
				const hoverItems = getHoverItems(word, document, position)
				if (typeof hoverItems == 'undefined') return;
				return new vscode.Hover(hoverItems);
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

	context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(
		MODE,
		{
			provideDocumentLinks(document, token) {
				return documentLinks(document);
			}
		}
	))

	context.subscriptions.push(vscode.languages.registerDefinitionProvider(MODE, {
		async provideDefinition(document, position) {
			const wordRange = document.getWordRangeAtPosition(position, /[_a-zA-Z0-9\.]{1,100}/);
			if (typeof wordRange == 'undefined') return;
			ast = await getAst(document);
			if (typeof ast == 'undefined') return;
			const data = astParser(ast, document, wordRange);
			if (data !== null && typeof data !== 'undefined') {
				return new vscode.Location(
					document.uri.with({ path: data.path }),
					new vscode.Position(data.position.line, data.position.character)
				);
			}
		}
	}))

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async documentChangeEvent => {
		if (documentChangeEvent) {
			setLanguageMode();
			updateDiagnostics(documentChangeEvent.document, collection);
		}
	}));

	context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(MODE, {
		provideDocumentFormattingEdits(document) {
			return formatter(document, context);
		}
	}));

	// editor/context menu for everdev commands

	//window doesnt support docker (se container)
	if (process.platform !== "win32") {
		const currentFile = () => {
			return vscode.window.activeTextEditor.document.uri.fsPath;
		}
		const currentFolder = () => {
			return path.dirname(currentFile());
		}
		const currentAbi = () => {
			return currentFile().replace(/\.t?sol/, '.abi.json');
		}

		let commandsTerminal;
		function createTerminal() {
			if (vscode.window.activeTerminal) {
				commandsTerminal = vscode.window.activeTerminal;
			}
			if (vscode.window.terminals.length > 0) {
				commandsTerminal = vscode.window.terminals[0];
			} else {
				commandsTerminal = vscode.window.createTerminal();
				commandsTerminal.show();
			}
			return commandsTerminal;
		}

		context.subscriptions.push(vscode.commands.registerCommand('deploy.contract', async () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev sol compile " + currentFile() + ' --output-dir ' + currentFolder());
			commandsTerminal.sendText("npx everdev contract deploy " + currentAbi() + " --value 10000000000 --network se");
			const abi = require(currentAbi());
			//if init or data present - read it from user
			if (abi.data.length > 0 || abi.functions.find(v => v.name == 'constructor') !== undefined) {
				await vscode.env.terminal.readLine();
			}
			commandsTerminal.sendText("echo 0:$(everdev contract info " + currentAbi() + " --network se | grep Address | cut -d':' -f3 | cut -d' ' -f1)");
		}));

		context.subscriptions.push(vscode.commands.registerCommand('deploy.debot', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev sol compile " + currentFile() + ' --output-dir ' + currentFolder());
			commandsTerminal.sendText("npx everdev contract deploy " + currentAbi() + " --value 10000000000 --network se");
			commandsTerminal.sendText("everdev contract run " + currentAbi() + " setABI --input \"dabi:'$(cat " + currentAbi() + " | xxd -ps -c 20000)'\" --network se");
			commandsTerminal.sendText("echo 0:$(everdev contract info " + currentAbi() + " --network se | grep Address | cut -d':' -f3 | cut -d' ' -f1)");
		}));
		context.subscriptions.push(vscode.commands.registerCommand('network.reset', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev se reset ");
		}));
		context.subscriptions.push(vscode.commands.registerCommand('contract.run', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev contract run " + currentAbi() + " --network se");
		}));
		context.subscriptions.push(vscode.commands.registerCommand('contract.runLocal', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev contract run-local " + currentAbi() + " --network se");
		}));

		context.subscriptions.push(vscode.commands.registerCommand('contract.startDebot', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("debotAddress=$(everdev contract info " + currentAbi() + " --network se | grep Address | cut -d':' -f3 | cut -d' ' -f1)");
			commandsTerminal.sendText("tonos-cli --url http://localhost debot fetch 0:$debotAddress");
		}));

		context.subscriptions.push(vscode.commands.registerCommand('js.wrap', () => {
			if (!commandsTerminal) commandsTerminal = createTerminal();

			commandsTerminal.show();
			commandsTerminal.sendText("npx everdev sol compile " + currentFile() + ' --output-dir ' + currentFolder());
			commandsTerminal.sendText("npx everdev js wrap " + currentFile());
		}));

		vscode.window.onDidCloseTerminal(closedTerminal => {
			if (commandsTerminal == closedTerminal) {
				commandsTerminal = undefined;
			}
		})
	}
}

function isDebot() {
	if (!!vscode.window.activeTextEditor.document) return false
	const content = vscode.window.activeTextEditor.document.getText();
	if (content.match(/is Debot/g) == null) {
		return false;
	}
	return true;
}

async function updateDiagnostics(document, collection) {
	vscode.commands.executeCommand('setContext', 'solidity-support.isDebot', isDebot());//for context menu
	if (document.languageId != MODE.language) return;
	collection.clear();
	vscode.workspace.saveAll();
	t_out = [];
	let filePath = document.uri.fsPath;
	if (path.extname(document.uri.fsPath) !== '.sol' && path.extname(document.uri.fsPath) !== '.tsol') {
		return;
	}
	const compileCommand = controllers[1].commands[1];
	let args = [];
	args['file'] = filePath;
	args['outputDir'] = path.resolve(__dirname, 'abi');
	args['includePath'] = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "node_modules");
	let r = await runCommand(compileCommand, args);

	if (r == undefined) {
		ast = getAst(document);
		return;
	}
	let collectionSet = r.map(value => {
		let line = Math.abs(value.coord.raw - 1);
		let character = Math.abs(value.coord.position - 1);
		let range;
		let errorFilePath = value.source.fsPath;
		if (errorFilePath !== document.uri.fsPath) {
			range = null;
			//maybe its import so find it and underline
			const text = document.getText();
			const errorFileName = path.basename(errorFilePath);
			const start = text.indexOf(errorFileName);
			if (start !== -1) {
				const end = start + errorFileName.length;
				range = new vscode.Range(document.positionAt(start), document.positionAt(end));
			}
		} else {
			range = new vscode.Range(new vscode.Position(line, character), new vscode.Position(line, character + value.errorLength));
		}

		return {
			code: '',
			message: value.info,
			range,
			severity: value.severity == 'Error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
			source: value.source.fsPath,
			relatedInformation: [
				new vscode.DiagnosticRelatedInformation(new vscode.Location(value.source, new vscode.Range(new vscode.Position(line, character), new vscode.Position(line, character + value.errorLength))), null)
			]
		}
	})
	collection.set(document.uri, collectionSet);
}

async function getAst(document) {
	const compileCommand = controllers[1].commands[2];
	const args = [];
	args['file'] = document.uri.fsPath;;
	args['outputDir'] = path.resolve(__dirname, 'abi');
	args['format'] = 'compact-json';
	args['includePath'] = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "node_modules");
	let r = await runCommand(compileCommand, args);
	if ((Array.isArray(r) && r.length > 0)) {
		for (let i = 0; i < r.length; i++) {
			// if error
			if (r[i].severity == 'Error') {
				return;
			}
		}
	}
	const astFilePath = path.resolve(args['outputDir'], `${path.parse(args.file).name}.ast.json`);
	if (fs.existsSync(astFilePath) == true) {
		const ast = fs.readFileSync(astFilePath, { encoding: 'utf-8' });
		try {
			const obj = JSON.parse(ast);
			return obj;
		} catch (e) {
			return;
		}
	}
}

async function runCommand(command, args) {
	const terminal = tondevTerminal();
	try {
		await command.run(tondevTerminal(), args);
	} catch (err) {
		terminal.writeError(err.toString());
	}
	if (typeof t_out !== 'undefined' && typeof t_out[0] !== 'undefined') return getErrors(t_out[0]);
}

function tondevTerminal() {
	if (!_tondevTerminal) {
		const output = vscode.window.createOutputChannel("TONDev");
		_tondevTerminal = {
			output,
			log: (...args) => {
				if (args.length > 0)
					t_out.push(args.join(""));
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

function cleanAbiDir() {
	//remove all from directory
	const abiDir = path.resolve(__dirname, 'abi');
	if (fs.existsSync(abiDir)) {
		fs.readdirSync(abiDir).forEach(file => {
			if (file == '.gitkeep') return;
			const curPath = path.resolve(abiDir, file);
			fs.unlinkSync(curPath);
		});
	}
}
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
