const path = require('path');
const fs = require('fs');
const { parseData } = require('./ast/parser');

function parseAstData(document) {
    const ast = getAst(document)
    if (typeof ast !== 'undefined') return parseData(ast);
}

function getAst(document) {
    const astPath = path.resolve(__dirname, 'abi', `${path.parse(document.uri.fsPath).name}.ast.json`);
    if (fs.existsSync(astPath)) {
        return JSON.parse(fs.readFileSync(astPath, { encoding: 'utf-8' }));        
    }
}

module.exports = {
    parseAstData,
    getAst
}