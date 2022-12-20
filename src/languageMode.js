const vscode = require('vscode');
const path = require('path');

async function setLanguageMode() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !editor.hasOwnProperty('document')) {
		return;
	}
	const doc = editor.document;
	
	const ext = path.extname(doc.fileName);
	if(ext !== '.sol' && ext !== '.tsol'){
		return;
	}

	if (doc.getText().match(/ton-solidity|ever-solidity|tvm\.|Tvm(cell|slice|builder)/m)) {
		if (doc.languageId !== "ton-solidity") await vscode.languages.setTextDocumentLanguage(doc, 'ton-solidity');
	} else {
		try {
			if (doc.languageId.match(/solidity/im)) await vscode.languages.setTextDocumentLanguage(doc, 'solidity');
		} catch (e) {
			return;
		}
	}
}

module.exports = {
	setLanguageMode
}