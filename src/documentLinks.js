const { DocumentLink, Range, Uri } = require("vscode");
const path = require("path");
const fs = require("fs");

function documentLinks(document){
    
    const text = document.getText();        
    const imports = text.match(/import\s+"(.*)"/gm);
    if(imports == null) return;
    const dir = path.dirname(document.uri.fsPath);
    let links = imports.map(i=>{
        const url = i.split("\"")[1];
        let newPath = url;
        if(url.match(/https?:\/\//) == null){
            newPath = path.resolve(dir, url);
        }      

        const start = text.indexOf(url);
        const end = start + url.length;
        let positionStart = document.positionAt(start);
        let positionEnd = document.positionAt(end);
        const uri = Uri.parse(newPath);

        if(!fs.existsSync(newPath)){
            return;
        };
        return new DocumentLink(new Range(positionStart, positionEnd), uri);
    })   
    
    links = links.filter(link => typeof link !== 'undefined');
    return links;
}

module.exports = {
    documentLinks
}