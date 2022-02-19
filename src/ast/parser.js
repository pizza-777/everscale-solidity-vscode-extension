const { parseFunctions, functionFilter } = require("./parser/parseFunctions.js");
const { parseVariables, variableFilter } = require("./parser/parseVariables.js");
const { parseContracts, contractFilter } = require("./parser/parseContracts.js");

var contracts = [];
var contractScope;
var contract;
var functions = [];
var variables = [];

function ifExistsInContracts(contract) {
    for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].prefix == contract) {
            return true;
        }
    }
    return false;
}

function parseData(ast) {
    for (let i = 0; i < ast.length; i++) {
        contract = Object.keys(ast[i].exportedSymbols)[0];
        contractScope = ast[i].exportedSymbols[contract][0];
        try{
            let obj = objectIterator(ast[i]);
        }catch(e){
            console.log(e)
        }
        
        if (typeof obj == 'undefined') continue;
    }
    contractOrInterfaceToFunctions(contracts, functions);
    return { ...functions, ...contracts, ...variables }
}

function contractOrInterfaceToFunctions(c, f) {
    let contractKind = (func) => {
        return c.filter(contract => {
            return contract.prefix == func.contract
        })[0].kind;
    }

    f = f.map(func => {
        let kind = contractKind(func);
        if (kind == 'library') {
            func.prefix = `${func.contract}.${func.prefix}`;
            func.body = `${func.contract}.${func.prefix}`;
        }

        if (kind == 'interface') {
            func.prefix = func.contract + '.' + func.prefix;
            func.body = func.contract + '(${0:address}).' + func.prefix;
        }

        return func;
    })
    return f;
}

function arrayIterator(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null && typeof arr[i] === 'object') {
            objectIterator(arr[i]);
        }
    }
}


function objectIterator(obj) {
    //variable
    const v = variableFilter(obj, contractScope);
    if (v !== null) {
        let data = parseVariables(v, contract);
        variables[data.prefix] = data;
    }
    //function
    const f = functionFilter(obj);
    if (f !== null) {
        let data = parseFunctions(f, contract);
        functions[data.prefix] = data;
    }

    const c = contractFilter(obj);
    if (c !== null && ifExistsInContracts(contract) == false) {
        let data = parseContracts(c);
        contracts[data.prefix] = data;
    }

    for (let k in obj) {
        if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            let node = objectIterator(obj[k]);
            if (node) {
                return node;
            }
        }
        if (Array.isArray(obj[k])) {
            arrayIterator(obj[k]);
        }
    }
}

module.exports = {
    parseData
}
// let start = Date.now();
// const fs = require('fs')
// const path = '/home/nikolai/ton-eth-bridge-token-contracts/contracts/TokenRoot.sol'
// const ast = JSON.parse(fs.readFileSync('/home/nikolai/everscale-solidity-vscode-extension/src/abi/TokenRoot.ast.json', { encoding: 'utf-8' }));

// let d = parseData(ast, path);
// console.log(d);
// console.log(Date.now() - start)