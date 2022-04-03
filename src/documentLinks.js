const { DocumentLink, Range, Uri } = require("vscode");
const path = require("path");
const fs = require("fs");

function documentLinks(document) {
    const text = document.getText();
    const imports = text.match(/import\s+["'](.*)["']/gm);
    if (imports == null) return;
    const dir = path.dirname(document.uri.fsPath);
    let links = imports.map(i => {
        const url = i.split(/['"]/)[1];
        let newPath = url;
        if (url.match(/https?:\/\//) !== null) {
            return;
        }

        newPath = searchLinks(url, dir);
        if (!newPath) {
            return;
        }

        const start = text.indexOf(url, document);
        const end = start + url.length;
        let positionStart = document.positionAt(start);
        let positionEnd = document.positionAt(end);
        return new DocumentLink(new Range(positionStart, positionEnd), Uri.parse('file://' + newPath, true));
    })

    links = links.filter(link => typeof link !== 'undefined');
    return links;
}

function searchLinks(url, dir) {
    if (fs.existsSync(path.resolve(dir, url))) {
        return path.resolve(dir, url);
    }

    if (fs.existsSync(path.resolve(dir, './' + url))) {
        return path.resolve(dir, './' + url);
    }

    //find broxus locklift contracts in node_modules folder
    const file_path = path.resolve(dir, "node_modules", url);
    if (fs.existsSync(file_path)) {
        return file_path;
    }
    return false;
}

module.exports = {
    documentLinks
}