
function getInputParams(functionItem) {
    let paramsBody = [];
    let paramsInputDescription = [];
    for (const [index, inputItem] of Object.entries(functionItem.parameters.parameters)) {
        paramsBody.push(`\${${Number(index) + 1}:${inputItem.typeName.name} ${inputItem.name}}`);
        paramsInputDescription.push(`${inputItem.typeName.name}:${inputItem.name}`);
    }
    return {
        body: `${functionItem.name}(${paramsBody.join(', ')})`,
        description: `function ${functionItem.name}(${paramsInputDescription.join(', ')})`
    }
}

function getOutputParams(functionItem) {
    let paramsOutputDescription = [];
    for (const [, outputItem] of Object.entries(functionItem.returnParameters.parameters)) {
        paramsOutputDescription.push(outputItem.typeName.name);
    }
    return paramsOutputDescription;
}

function parseFunctions(obj, contract) {
    let prefix = obj.name;
    let body, description;
    ({ body, description } = getInputParams(obj));
    let paramsOutputDescription = getOutputParams(obj)
    description += paramsOutputDescription.length > 0 ? `: ${paramsOutputDescription.join(', ')}` : ':{}';

    return { prefix, body, description, contract, CompletionItemKind: 'function' };
}

function functionFilter(obj) {
    if (
        obj !== null
        && typeof obj.nodeType !== 'undefined'
        && obj.nodeType == 'FunctionDefinition'
        && typeof obj.visibility !== 'undefined' 
        //&& obj.visibility.match(/external|public/)
    ) {
        if (obj.name !== '') return obj;
    }
    return null;
}

module.exports = {
    parseFunctions,
    functionFilter
}