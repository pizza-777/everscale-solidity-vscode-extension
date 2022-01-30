const vscode = require('vscode');

async function setLanguageMode() {
	const doc = vscode.window.activeTextEditor.document;	
	if (doc.getText().match(/ton\-solidity/g)) {
		await vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'ton-solidity');	
	}	
}

module.exports = {
	setLanguageMode
}