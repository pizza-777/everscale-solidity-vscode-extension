const strip = require('strip-comments');
const path = require('path');

function parseAbiFunctions(document) {
    let abiPathData = path.parse(document.uri.fsPath);
    let abiPath = path.resolve(__dirname, `abi/${abiPathData.name}.abi.json`);
    let abi;
    try {
        delete require.cache[abiPath]
        abi = require(abiPath);
    } catch (e) {
        return {};
    }
    let completions = {};
    for (const [, functionItem] of Object.entries(abi.functions)) {
        if (functionItem.name == 'constructor') {
            continue;
        }
        //public variable
        if (functionItem.outputs.length == 1 && functionItem.outputs[0].name == functionItem.name) {
            continue;
        }
        let key = `function ${functionItem.name}`;
        let prefix = functionItem.name;
        let paramsBody = [];
        let paramsInputDescription = [];
        //input
        for (const [index, inputItem] of Object.entries(functionItem.inputs)) {
            paramsBody.push(`\${${Number(index) + 1}:${inputItem.type} ${inputItem.name}}`);
            paramsInputDescription.push(`${inputItem.type}:${inputItem.name}`);
        }
        let body = `${functionItem.name}(${paramsBody.join(', ')})`;
        let description = `function ${functionItem.name}(${paramsInputDescription.join(', ')})`;
        //output
        let paramsOutputDescription = [];
        for (const [, outputItem] of Object.entries(functionItem.outputs)) {
            paramsOutputDescription.push(outputItem.type);
        }
        description += paramsOutputDescription.length > 0 ? `: ${paramsOutputDescription.join(', ')}` : '';
        completions[key] = { prefix, body, description };
    }

    return completions;
}

function parsePrivateFunctions(document) {
    let code = document.getText();
    code = strip(code);
    let privateFunctions = {};
    let matches = [...code.matchAll(/((function\s+([a-z_A-Z0-9]+))\((.*)\)(.*private.*)){/gm)];
    for (let item of matches) {
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
    parsePrivateFunctions    
}