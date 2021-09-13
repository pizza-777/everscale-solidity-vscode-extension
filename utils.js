const vscode = require('vscode');

const snippetsJsonHover = require("./snippets/hover.json");
const wordsSetHover = snippetsJsonHover['.source.ton-solidity'];

const snippetsJsonCompletion = require("./snippets/completion.json");
const wordsSetCompletion = snippetsJsonCompletion['.source.ton-solidity'];

const fs = require("fs");
const path = require('path');
function getErrors(string) {
    if (!string) {
        return;
    }
    let arr = string.split("\n\n");

    let a = arr.map(value => {
        return value.split("\n")
    })

    a = a.filter(value => {
        if (value.length < 5) {
            return false;
        }
        return true;
    })

    return a.map((value) => {
        let coord = value[1] ? value[1].match(/\d+/g) : null;
        let severity = value[0].match(/Warning/) ? 'Warning' : 'Error';
        let raw = !coord ? null : Number(coord[0]);
        let position = !coord ? null : Number(coord[1]);
        let errorLenght = value[4] ? Number(value[4].match(/[\^]/g).length) : null;
        return {
            info: value[0],
            coord: {
                raw,
                position
            },
            errorLenght,
            severity
        }
    })
}

function getSuggestion(word) {
    let suggestion = null;
    let counter = 0;
    if (word.match(/AbiHeader|msgValue|pragma|(ton-)?solidity/)) {
        let snippetPath = path.resolve(__dirname, "snippets/includes/" + word + ".md");
        suggestion = fs.readFileSync(snippetPath, "utf8");
        return suggestion;
    }
    let prefixLength = 0;
    for (const [, value] of Object.entries(wordsSetHover)) {
        if (word.includes(value.prefix)) {
            //take the most matched value
            if (value.prefix.length < prefixLength) {
                continue;
            }
            prefixLength = value.prefix.length;
            if (Array.isArray(value.description)) {
                suggestion = value.description.join("\n")
            } else {
                suggestion = value.description;
            }
            counter++;
            if (counter == 2) {
                let snippetPath = path.resolve(__dirname, "snippets/includes/" + value.prefix.replace(/^\./, '') + ".md");
                suggestion = fs.readFileSync(snippetPath, "utf8");
                return suggestion;
            }
        }
    }
    return suggestion;
}

function getCompletionItems(document) {
    //все собрать
    parseAbiFunctions(document);
    let completionItems = [];
    for (const [key, value] of Object.entries(wordsSetCompletion)) {
        const completionItem = new vscode.CompletionItem(value.prefix, getSnippetType(value.body));
        completionItem.detail = key;
        if (Array.isArray(value.description)) {
            completionItem.documentation = value.description.join("\n");
        } else {
            completionItem.documentation = value.description;
        }
        completionItem.insertText = new vscode.SnippetString(value.body);

        completionItems.push(completionItem);
    }

    return completionItems;
    //применить фильтер (а может он и сам применится)
}

function parseAbiFunctions(document) {
    let abiPathData = path.parse(document.uri.fsPath);
    let abiPath = path.resolve(__dirname, "abi/" + abiPathData.name + ".abi.json");
    let abi;
    try {
        delete require.cache[abiPath]
        abi = require(abiPath);
    } catch (e) {
        return [];
    }
    for (const [, functionItem] of Object.entries(abi.functions)) {
        if (functionItem.name == 'constructor') {
            continue;
        }
        //public variable
        if (functionItem.outputs.length == 1 && functionItem.outputs[0].name == functionItem.name) {
            continue;
        }
        let key = 'function ' + functionItem.name;
        let prefix = functionItem.name;
        let paramsBody = [];
        let paramsInputDescription = [];
        //input
        for (const [index, inputItem] of Object.entries(functionItem.inputs)) {
            paramsBody.push('${' + (Number(index) + 1) + ':' + inputItem.type + ' ' + inputItem.name + '}');
            paramsInputDescription.push(inputItem.type+':'+inputItem.name);            
        }
        let body = functionItem.name + '(' + paramsBody.join(', ') + ')';
        let description = 'function '+functionItem.name+'('+paramsInputDescription.join(', ')+')';
        //output
        let paramsOutputDescription = [];
        for (const [, outputItem] of Object.entries(functionItem.outputs)) {            
            paramsOutputDescription.push(outputItem.type);            
        }
        description += ': '+paramsOutputDescription.join(', ')
        wordsSetCompletion[key] = { prefix, body, description };
    }
}

function getSnippetType(body) {
    if (body.match(/\..*\(/)) {
        return vscode.CompletionItemKind.Method;
    }
    if (body.match(/\.\w+/)) {
        return vscode.CompletionItemKind.Property;
    }
    if (body.match(/\(.*\)/)) {
        return vscode.CompletionItemKind.Function;
    }
    if (body.match(/\b[nmicrlkegMatTGo]+\b/)) {
        return vscode.CompletionItemKind.Unit;
    }

   
    return vscode.CompletionItemKind.Snippet;
}

module.exports = {
    getErrors,
    getSuggestion,
    getCompletionItems
}