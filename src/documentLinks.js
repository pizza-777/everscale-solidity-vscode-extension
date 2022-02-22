const { DocumentLink, Range, Uri, workspace } = require("vscode");
const path = require("path");
const fs = require("fs");

function documentLinks(document) {

    const text = document.getText();
    const imports = text.match(/import\s+"(.*)"/gm);
    if (imports == null) return;
    const dir = path.dirname(document.uri.fsPath);
    let links = imports.map(i => {
        const url = i.split("\"")[1];
        let newPath = url;
        if (url.match(/https?:\/\//) == null) {
            newPath = path.resolve(dir, url);
        } else {
            return;
        }

        const start = text.indexOf(url);
        const end = start + url.length;
        let positionStart = document.positionAt(start);
        let positionEnd = document.positionAt(end);

        if (!fs.existsSync(newPath)) {
            newPath = searchLinks(url);
            if (!newPath) {
                return;
            }
        };

        return new DocumentLink(new Range(positionStart, positionEnd), Uri.parse(newPath));
    })

    links = links.filter(link => typeof link !== 'undefined');
    return links;
}

//for searching broxus locklift contracts in node_modules folder
function searchLinks(url) {
    const file_path = path.resolve(workspace.workspaceFolders[0].uri.path, "node_modules", url);
    if (fs.existsSync(file_path)) {
        return file_path;
    }
    return false;
}

module.exports = {
    documentLinks
}