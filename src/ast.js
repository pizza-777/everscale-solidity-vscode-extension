const { findNodeByPosition } = require("./ast/findNodeByPosition");
const { findNodeById } = require("./ast/findNodeById");
const fs = require('fs');

function astParser(ast, document, position) {
    if (typeof ast == 'undefined') return;
    ast[1].absolutePath = document.uri.fsPath;
    const astPosition = convertPositionDocToAst(document, position)
    const node = findNodeByPosition(ast, astPosition);
    if (node !== null && typeof node !== 'undefined' && typeof node.referencedDeclaration !== 'undefined') {
        const referencedNode = findNodeById(ast, node.referencedDeclaration);
        const src = Number(referencedNode.src.split(":")[2]);
        const solPath = ast[src + 1].absolutePath;
        const docPosition = convertPositionAstToDoc(solPath, referencedNode.src);
        return {
            path: solPath,
            position: docPosition
        }
    }
}

function convertPositionDocToAst(document, position) {
    const txt = document.getText().split("\n");

    let astPosition = 0;
    for (let index = 0; index < position.start.line; index++) {
        astPosition += txt[index].length + 1;
    }

    astPosition += position.start.character;
    return astPosition;
}

function convertPositionAstToDoc(solPath, astPosition) {
    let character = Number(astPosition.split(":")[0]);
    const lines = fs.readFileSync(solPath, { encoding: "utf-8" }).split("\n");

    let line = 0;

    for (let index = 0; index < lines.length; index++) {
        if (lines[index].length < character) {
            character -= (lines[index].length + 1);
        } else {
            break;
        }
        line++;
    }
    return {
        line,
        character
    }
}

module.exports = {
    astParser
}