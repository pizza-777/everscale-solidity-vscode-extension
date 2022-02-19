const path = require('path');
const fs = require('fs');
const { parseData } = require('./ast/parser');

function parseAstData(document){
    const astPath = path.resolve(__dirname, 'abi', `${path.parse(document.uri.fsPath).name}.ast.json`);
    if(fs.existsSync(astPath)){
        const ast = JSON.parse(fs.readFileSync(astPath, { encoding: 'utf-8' }));
        return parseData(ast);        
    }    
}

module.exports = {
    parseAstData
}