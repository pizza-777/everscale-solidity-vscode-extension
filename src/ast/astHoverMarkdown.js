const { contractFilter } = require("./parser/parseContracts")
const { functionFilter } = require("./parser/parseFunctions")

var contractName = '';

function astHoverMarkdown(node, ast) {
    // get element source contract or interface name
    contractName = getContractName(node, ast);

    let markdown = '';
    //variable
    const v = variableFilter(node);
    if (v !== null) {
        markdown = variableMarkdown(node);
    }
    //function
    const f = functionFilter(node);
    if (f !== null) {
        markdown = functionMarkdown(node);
    }

    //contract
    const c = contractFilter(node);
    if (c !== null) {
        markdown = contractMarkdown(node);
    }

    //modifier
    const m = modifierFilter(node);
    if (m !== null) {
        markdown = modifierMarkdown(node);
    }

    return markdown;
}

function getContractName(node, ast = undefined){
    if(typeof ast == 'undefined'){
        return '';
    }
    let contractId = node.src.split(":")[2];
    for(let i = 0; i < ast[contractId].nodes.length; i++){
        node = ast[contractId].nodes[i];
        const c = contractFilter(node);
        if (c !== null && typeof node.contractKind !== 'undefined' && node.contractKind !== null) {
            return  '\n//' + c.kind +' ' + c.name + '\n';
        }
    }
}

function variableMarkdown(node) {
    let md = '```\n';
    md += typeof node.documentation !== 'undefined' && node.documentation !== null ? '/*' + node.documentation + '*/\n' : '';
    md += node.typeDescriptions.typeString + ' ';
    md += node.constant ? 'constant ' : '';
    md += node.stateVariable ? 'static ' : '';
    md += node.name;
    if (node.value !== null) {
        md += typeof node.value.value !== 'undefined' && node.value.value !== null ? '//' + node.value.value : '';
    }
    md += contractName;
    md += '\n```';

    return md;
}
function functionMarkdown(node) {
    let md = '```\n';
    md += node.documentation !== null ? '/*' + node.documentation + '*/\n' : '';
    md += 'function ';
    md += node.name;
    md += '(';
    let params = node.parameters.parameters;
    let input = [];
    for (let index = 0; index < params.length; index++) {
        input.push(`${params[index].typeDescriptions.typeString} ${params[index].name}`);
    }
    md += input.join(", ");
    md += ') ';
    md += node.visibility;
    md += node.virtual ? 'virtual' : '';
    params = node.returnParameters.parameters;
    let output = [];
    md += ' returns(';
    for (let index = 0; index < params.length; index++) {
        output.push(params[index].typeDescriptions.typeString);
    }
    md += output.join(",");
    md += ')';
    md += '{}';
    md += '\n```';
    md += contractName;
    return md;
}
function contractMarkdown(node) {
    let md = '```\n';
    md += node.documentation !== null ? '/*' + node.documentation + '*/\n' : '';
    md += node.abstract ? 'abstract ' : '';
    md += node.contractKind + ' ';
    md += node.name;
    md += '{}';
    md += '\n\n';
    md += '//contract functions and variables\n```\n';
    for (let index = 0; index < node.nodes.length; index++) {
        md += astHoverMarkdown(node.nodes[index]);
        md += '\n';
    }

    return md;
}

function modifierMarkdown(node) {
    let md = '```\n';
    md += node.documentation !== null ? '/*' + node.documentation + '*/\n' : '';
    md += 'modifier ';
    md += node.name;
    md += '(';
    let params = node.parameters.parameters;
    let input = [];
    for (let index = 0; index < params.length; index++) {
        input.push(`${params[index].typeDescriptions.typeString} ${params[index].name}`);
    }
    md += input.join(", ");
    md += ') ';
    md += '{}';
    md += contractName;
    md += '\n```';    
    return md;
}


function variableFilter(obj) {
    if (
        obj !== null &&
        typeof obj.nodeType !== 'undefined' &&
        obj.nodeType == 'VariableDeclaration' &&
        typeof obj.scope !== 'undefined'
    ) {
        if (obj.name !== '') return obj;
    }
    return null;
}

function modifierFilter(obj) {
    if (
        obj !== null &&
        typeof obj.nodeType !== 'undefined' &&
        obj.nodeType == 'ModifierDefinition'
    ) {
        if (obj.name !== '') return obj;
    }
    return null;
}

module.exports = {
    astHoverMarkdown
}

