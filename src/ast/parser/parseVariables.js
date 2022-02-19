function parseVariables(obj, contract) {
    let type = obj.constant ? 'constant' : 'variable';    
    let value = function(){
        if(type == 'constant'){
              return '//value: '+ obj.value.value;
        }
        return '';
    }
    return {
        prefix: obj.constant ? `${contract}.${obj.name}` : obj.name,
        body: obj.constant ? `${contract}.${obj.name}` : obj.name,
        description: `${type} ${obj.typeName.name} ${obj.name}` + value(),
        CompletionItemKind: type
    }
}

function variableFilter(obj, contractScope) {
    if (
        obj !== null &&
        typeof obj.nodeType !== 'undefined' &&
        obj.nodeType == 'VariableDeclaration' &&
        typeof obj.scope !== 'undefined' &&
        obj.scope == contractScope
    ) {
        if (obj.name !== '') return obj;
    }
    return null;
}

module.exports = {
    parseVariables,
    variableFilter
}