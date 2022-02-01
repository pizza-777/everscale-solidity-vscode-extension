const vscode = require('vscode');

async function setLanguageMode() {
	if(!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.hasOwnProperty('document'))
	{
		return;
	}
	const doc = vscode.window.activeTextEditor.document;	
	if (doc.getText().match(/ton\-solidity/g)) {
		await vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'ton-solidity');	
	}else{
		try{
			await vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, 'solidity');	
		}catch(e){
			return;
		}	 	
	}	
}

module.exports = {
	setLanguageMode
}