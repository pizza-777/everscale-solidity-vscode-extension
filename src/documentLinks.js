const { DocumentLink, Range, Uri } = require("vscode");
const path = require("path");

function documentLinks(document){
    
    let text = document.getText();        
    const imports = text.match(/import\s+"(.*)"/gm);
    if(imports == null) return;
    const dir = path.dirname(document.uri.fsPath);
    const links = imports.map(i=>{
        const url = i.split("\"")[1];
        let newPath = url;
        if(url.match(/https?:\/\//) == null){
            newPath = path.resolve(dir, url);
        } 
        const start = text.indexOf(url);
        const end = start + url.length;
        const positionStart = document.positionAt(start);
        const positionEnd = document.positionAt(end);
        const uri = Uri.parse(newPath);
        return new DocumentLink(new Range(positionStart, positionEnd), uri);
    })
    
    return links;
}

module.exports = {
    documentLinks
}