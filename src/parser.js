const strip = require('strip-comments');
const path = require('path');

function getAbi(document) {
    let abiPathData = path.parse(document.uri.fsPath);
    let abiPath = path.resolve(__dirname, `abi/${abiPathData.name}.abi.json`);
    try {
        delete require.cache[abiPath]
        let abi = require(abiPath);
        return abi;
    } catch (e) {
        return { functions: {} };
    }
}

function getInputParams(functionItem) {
    let paramsBody = [];
    let paramsInputDescription = [];
    for (const [index, inputItem] of Object.entries(functionItem.inputs)) {
        paramsBody.push(`\${${Number(index) + 1}:${inputItem.type} ${inputItem.name}}`);
        paramsInputDescription.push(`${inputItem.type}:${inputItem.name}`);
    }
    return {
        body: `${functionItem.name}(${paramsBody.join(', ')})`,
        description: `function ${functionItem.name}(${paramsInputDescription.join(', ')})`
    }
}

function getOutputParams(functionItem) {
    let paramsOutputDescription = [];
    for (const [, outputItem] of Object.entries(functionItem.outputs)) {
        paramsOutputDescription.push(outputItem.type);
    }
    return paramsOutputDescription;
}

function publicVariable(functionItem) {
    return functionItem.outputs.length == 1 && functionItem.outputs[0].name == functionItem.name;
}

function parseAbiFunctions(document) {
    let abi = getAbi(document);
    let completions = {};
    for (const [, functionItem] of Object.entries(abi.functions)) {
        if (functionItem.name == 'constructor' || publicVariable(functionItem)) continue;

        let key = `function ${functionItem.name}`;
        let prefix = functionItem.name;
        let body, description;
        ({ body, description } = getInputParams(functionItem));
        let paramsOutputDescription = getOutputParams(functionItem)
        description += paramsOutputDescription.length > 0 ? `: ${paramsOutputDescription.join(', ')}` : ':{}';

        completions[key] = { prefix, body, description };
    }

    return completions;
}

function parseAbiVaribles(document) {
    let abi = getAbi(document);
    let completions = {};
    for (const [, variableItem] of Object.entries(abi.functions)) {
        if (variableItem.inputs.length > 0) {
            for (let index = 0; index < variableItem.inputs.length; index++) {
                let name = variableItem.inputs[index].name;
                completions[name] = { prefix: name, body: name, description: 'variable' };
            }
        }

        if (variableItem.outputs.length > 0) {
            for (let index = 0; index < variableItem.outputs.length; index++) {
                let name = variableItem.outputs[index].name;
                completions[name] = { prefix: name, body: name, description: 'variable' };
            }
        }
    }
    if (typeof abi.fields !== 'undefined') {
        for (const [, variableItem] of Object.entries(abi.fields)) {
            completions[variableItem.name] = { prefix: variableItem.name, body: variableItem.name, description: 'variable' };
        }
    }

    return completions;
}

function parsePrivateFunctions(document) {
    let code = document.getText();
    code = strip(code);
    let privateFunctions = {};
    let matches = [...code.matchAll(/((function\s+([a-z_A-Z0-9]+))\((.*)\)(.*private.*)){/gm)];
    for (let item of matches) {
        if(item[3].match(/onCodeUpgrade|constructor/)) continue;
        let params = item[4].split(",");
        let fparams = params.map((value, index) => {
            return `\${${Number(index + 1)}:${value}}`;
        })
        let importParams = fparams.join(", ");
        privateFunctions[item[2]] = {
            prefix: item[3],
            body: `${item[2]}(${importParams})`,
            description: item[1]
        }
    }
    return privateFunctions;
}

module.exports = {
    parseAbiFunctions,
    parsePrivateFunctions,
    parseAbiVaribles
}