const vscode = require('vscode');
const path = require('path');

async function setLanguageMode() {
	if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.hasOwnProperty('document')) {
		return;
	}
	const doc = vscode.window.activeTextEditor.document;
	
	const ext = path.extname(doc.fileName);
	if(ext !== '.sol'){
		return;
	}

	if (doc.getText().match(/ton-solidity|tvm\.|Tvm(cell|slice|builder)/gm)) {
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