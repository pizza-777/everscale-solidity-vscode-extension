function parseContracts(contract) {
    return {
        prefix: contract.name,
        body: contract.name,
        description: `${contract.kind} ${contract.name}`,
        kind: contract.kind,
        CompletionItemKind: contract.kind
    }
}

function contractFilter(obj) {
    if (
        obj !== null &&
        typeof obj.contractKind !== 'undefined'
    ) {
        return {
            name: obj.name,
            kind: obj.contractKind
        }
    }
    return null;
}

module.exports = {
    parseContracts,
    contractFilter
}