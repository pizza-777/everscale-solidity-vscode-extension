const { findNodeByPosition } = require("./ast/findNodeByPosition");
const { findNodeById } = require("./ast/findNodeById");
const { ifBroxus } = require("./documentLinks");
const fs = require('fs');
const vscode = require("vscode")
const path = require("path")

function astParser(ast, document, position) {
    if (typeof ast == 'undefined') return;
    const astPosition = convertPositionDocToAst(document, position)
    const node = findNodeByPosition(ast, astPosition, document);

    //override node searcher
    const word = document.getText(position);
    if (word.match(/\boverride\b/) !== null && typeof node.name !== 'undefined') {
        let el = findOverrideNodeByName(node.name, ast);
        const src = Number(el.src.split(":")[2]);
        const solPath = searchPath(ast[src].absolutePath);
        const docPosition = convertPositionAstToDoc(solPath, el.src);
        return {
            path: solPath,
            position: docPosition
        }
    }
    //other
    if (node !== null && typeof node !== 'undefined' && typeof node.referencedDeclaration !== 'undefined') {
        const referencedNode = findNodeById(ast, node.referencedDeclaration);
        const src = Number(referencedNode.src.split(":")[2]);
        const solPath = searchPath(ast[src].absolutePath);
        const docPosition = convertPositionAstToDoc(solPath, referencedNode.src);
        return {
            path: solPath,
            position: docPosition
        }
    }
}

function findOverrideNodeByName(functionName, currentNode) {
    const searchedElement = function (currentNode, functionName) {
        if (typeof currentNode.name !== 'undefined'
            && currentNode.name == functionName
            && typeof currentNode.implemented !== 'undefined'
            && currentNode.implemented == false
        ) {
            return currentNode;
        }
        return null;
    }

    if (Array.isArray(currentNode)) {
        for (let i = 0; i < currentNode.length; i++) {
            if (currentNode[i] !== null && typeof currentNode[i] === 'object') {
                let r = findOverrideNodeByName(functionName, currentNode[i]);
                if (r !== null) {
                    return r;
                }
            }
        }
    }
    if (currentNode !== null && typeof currentNode === 'object' && !Array.isArray(currentNode)) {
        for (var index in currentNode) {
            let r = searchedElement(currentNode, functionName);
            if (r !== null) {
                return r;
            }

            r = findOverrideNodeByName(functionName, currentNode[index]);
            if (r !== null) {
                return r;
            }

        }
    }

    return null;
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

function searchPath(absolutePath) {  
    let _path = path.resolve(absolutePath);
    if (fs.existsSync(_path)) {
        return _path;
    }
    return ifBroxus(absolutePath);    
}

module.exports = {
    astParser,
    findHoverNode
}