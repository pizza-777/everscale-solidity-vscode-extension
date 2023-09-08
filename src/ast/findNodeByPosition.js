const path = require("path");
const vscode = require("vscode") 

function findNodeByPosition(ast, position, document) {
    for (let i = 0; i < ast.length; i++) {
        if (pathsAreEqual(ast[i].absolutePath, document.uri.fsPath)) {
            return objectIterator(ast[i], position);
        }
    }
}

function arrayIterator(arr, position) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null && typeof arr[i] === 'object') {
            const node = objectIterator(arr[i], position);
            if (node) {
                return node;
            }
        }
    }
}

function objectIterator(obj, position) {
    if (obj !== null && typeof obj.src !== 'undefined' && inRange(obj.src, position) == false) {
        return;
    }
    if (typeof obj.referencedDeclaration !== 'undefined') {
        return obj;
    }
    if (obj !== null
        && typeof obj.overrides !== 'undefined'
        && obj.overrides !== null
        && typeof obj.overrides.src !== 'undefined'
        && obj.overrides.src !== null
        && inRange(obj.overrides.src, position) == true) {
        obj.referencedDeclaration = obj.overrides.id
        return obj;
    }
    for (let k in obj) {
        if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            let node = objectIterator(obj[k], position);
            if (node) {
                return node;
            }
        }
        if (Array.isArray(obj[k])) {
            let node = arrayIterator(obj[k], position)
            if (node) {
                return node;
            }
        }
    }
}

function inRange(astPosition, position) {
    const src = astPosition.split(":");
    const start = Number(src[0]);
    const end = Number(src[1]) + start;
    if (position >= start && position <= end) {
        return true;
    }

    return false;
}

function pathsAreEqual(path1, path2) {     
    const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    //useful for win
    if (path.resolve(basePath, path1).toLowerCase() === path2.toLowerCase()){
        return true;
    }
    path1 = path.resolve(path1);
    path2 = path.resolve(path2);

    return path1 === path2;
}

module.exports = {
    findNodeByPosition
}