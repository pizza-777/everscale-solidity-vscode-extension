const vscode = require('vscode');

async function setLanguageMode() {
	if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.hasOwnProperty('document')) {
		return;
	}
	const doc = vscode.window.activeTextEditor.document;

	if (doc.getText().match(/(pragma) (ton-solidity)\s?([0-9a-zA-Z_\.\s\~|^<>=]+)?\s?(;)/gm)) {
		if (doc.languageId !== "ton-solidity") await vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'ton-solidity');
	} else {
		try {
			if (doc.languageId !== "solidity" && doc.languageId !== 'Solidity') await vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'solidity');
		} catch (e) {
			return;
		}
	}
}

module.exports = {
	setLanguageMode
}