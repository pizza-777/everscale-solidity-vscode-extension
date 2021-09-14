const vscode = require('vscode');
const strip = require('strip-comments');

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

function highliteIt(functionSet){
      Object.keys(functionSet).map(function(k) {
        functionSet[k] = {
            prefix: functionSet[k].prefix,
            body: functionSet[k].body,
            description: "```\n"+functionSet[k].description+"\n```"//enable highliting for code
        }
      });

      return functionSet;
}

function getHoverSuggestion(word, document) {
    let userFunctions = highliteIt(parseAbiFunctions(document));
    let privateFunctions = highliteIt(parsePrivateFunctions(document))
  
    let wordsHover = { ...wordsSetHover, ...userFunctions, ...privateFunctions};        
    let suggestion = null;
    let counter = 0;
    if (word.match(/AbiHeader|msgValue|pragma|(ton-)?solidity/)) {
        let snippetPath = path.resolve(__dirname, "snippets/includes/" + word + ".md");
        suggestion = fs.readFileSync(snippetPath, "utf8");
        return suggestion;
    }
    let prefixLength = 0;
    for (const [, value] of Object.entries(wordsHover)) {
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
    let completions = { ...wordsSetCompletion, ...parseAbiFunctions(document), ...parsePrivateFunctions(document)};    
    let completionItems = [];
    for (const [key, value] of Object.entries(completions)) {
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
}


function parseAbiFunctions(document) {
    let abiPathData = path.parse(document.uri.fsPath);
    let abiPath = path.resolve(__dirname, "abi/" + abiPathData.name + ".abi.json");
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
        description += paramsOutputDescription.length > 0 ? ': '+paramsOutputDescription.join(', ') : '';
        completions[key] = { prefix, body, description };
    }

    return completions;
}

function parsePrivateFunctions(document){
    let code = document.getText();
    code = strip(code);
    let privateFunctions = {};
    let matches = [...code.matchAll(/((function\s+([a-z_A-Z0-9]+))\((.*)\)(.*private.*)){/gm)];  
        for(let item of matches){
            let params = item[4].split(",");
            let fparams = params.map((value, index)=>{
                return '${'+Number(index+1)+':'+value+'}';
            })
            let importParams = fparams.join(", ");
            privateFunctions[item[2]] = {
                prefix: item[3],
                body: item[2]+'('+importParams+')',
                description: item[1]
            }
        }
    return privateFunctions;
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
    getHoverSuggestion,
    getCompletionItems
}