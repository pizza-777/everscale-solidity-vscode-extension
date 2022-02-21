const { findNodeByPosition } = require("./ast/findNodeByPosition");
const { findNodeById } = require("./ast/findNodeById");
const fs = require('fs');
const vscode = require("vscode")

function astParser(ast, document, position) {
    if (typeof ast == 'undefined') return;
    const astPosition = convertPositionDocToAst(document, position)
    const node = findNodeByPosition(ast, astPosition, document);
    if (node !== null && typeof node !== 'undefined' && typeof node.referencedDeclaration !== 'undefined') {
        const referencedNode = findNodeById(ast, node.referencedDeclaration);
        const src = Number(referencedNode.src.split(":")[2]);
        const solPath = ast[src].absolutePath;
        const docPosition = convertPositionAstToDoc(solPath, referencedNode.src);
        return {
            path: solPath,
            position: docPosition
        }
    }
}

function findHoverNode(ast, document, position) {
    if (typeof ast == 'undefined') return;
    position = {
        start: {
            line: position.line,
            character: position.character
        }
    }
    const astPosition = convertPositionDocToAst(document, position)
    const node = findNodeByPosition(ast, astPosition, document);
    if (node !== null && typeof node !== 'undefined' && typeof node.referencedDeclaration !== 'undefined') {
        const refNode = findNodeById(ast, node.referencedDeclaration);
        return refNode;
    }
}

function convertPositionDocToAst(document, position) {   
    return document.offsetAt(new vscode.Position(position.start.line, position.start.character));   
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
    astParser,
    findHoverNode
}