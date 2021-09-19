const vscode = require('vscode');
const { parseAbiFunctions, parsePrivateFunctions } = require("./parser");

const snippetsJsonHover = require("./snippets/hover.json");
const wordsSetHover = snippetsJsonHover['.source.ton-solidity'];

const snippetsJsonCompletion = require("./snippets/completion.json");
const wordsSetCompletion = snippetsJsonCompletion['.source.ton-solidity'];

const fs = require("fs");
const path = require('path');

function formatDescription(description) {
    if (Array.isArray(description)) {
        return description.join("\n")
    }
    return description;
}

function getSnippetsIncludes(name) {
    let snippetPath = path.resolve(__dirname, `snippets/includes/${name}.md`);
    return fs.readFileSync(snippetPath, "utf8");
}

function getSnippetType(body) {
    if (body.match(/\..*\(/)) return vscode.CompletionItemKind.Method;
    if (body.match(/\.\w+/)) return vscode.CompletionItemKind.Property;
    if (body.match(/\(.*\)/)) return vscode.CompletionItemKind.Function;
    if (body.match(/\b[nmicrlkegMatTGo]+\b/)) return vscode.CompletionItemKind.Unit;
    return vscode.CompletionItemKind.Snippet;
}

function highliteIt(functionSet) {
    Object.keys(functionSet).map((k) => {
        functionSet[k] = {
            prefix: functionSet[k].prefix,
            body: functionSet[k].body,
            description: "```\n" + functionSet[k].description + "\n```"//enable highliting for code
        }
    });
    return functionSet;
}

function getErrors(string) {
    if (!string) return;

    let arr = string.split("\n\n");

    let a = arr.map(value => {
        return value.split("\n")
    })

    a = a.filter(value => {
        if (value.length < 5) return false;
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

function checkParam(find, str) {
    const re = new RegExp(`${find}$`);
    return str.match(re);    
}

function getHoverItems(word, document) {
    let abiFunctions = highliteIt(parseAbiFunctions(document));
    let privateFunctions = highliteIt(parsePrivateFunctions(document))

    let wordsHover = { ...wordsSetHover, ...abiFunctions, ...privateFunctions };
    let suggestion = null;
    let counter = 0;
    if (word.match(/AbiHeader|msgValue|pragma|(ton-)?solidity/)) {
        return getSnippetsIncludes(word);
    }
    let prefixLength = 0;
    for (const [, value] of Object.entries(wordsHover)) {
        if (!checkParam(value.prefix, word)) continue;    
        //take the most matched value
        if (value.prefix.length < prefixLength) continue;
        if (value.prefix.length == prefixLength) counter++;
        prefixLength = value.prefix.length;

        suggestion = formatDescription(value.description);
        if (counter > 0) return getSnippetsIncludes(value.prefix.replace(/^\./, ''));

    }
    return suggestion;
}

function getSnippetItems(document) {
    let completions = { ...wordsSetCompletion, ...parseAbiFunctions(document), ...parsePrivateFunctions(document) };
    let completionItems = [];
    for (const [key, value] of Object.entries(completions)) {
        const completionItem = new vscode.CompletionItem(value.prefix, getSnippetType(value.body));
        completionItem.detail = key;
        completionItem.documentation = formatDescription(value.description);
        completionItem.insertText = new vscode.SnippetString(value.body);

        completionItems.push(completionItem);
    }
    return completionItems;
}

function getFuncData(funcName, funcs) {
    for (const [, func] of Object.entries(funcs)) {
        if (func.prefix.includes(funcName)) {
            let label = func.body.replace(/(\{|\$|[0-9]:|\\|})/gm,'');       
            return { label }
        }
    }
    return null;
}

function getSignatures(document, position) {
    let funcs = { ...parseAbiFunctions(document), ...parsePrivateFunctions(document), ...wordsSetCompletion };
    const wordRange = document.getWordRangeAtPosition(position, /[_a-zA-Z0-9\.\(\,]+/);;
    const funcName = document.getText(wordRange).replace(/\(.*/g, '');
    const data = getFuncData(funcName, funcs);
    if (!data) return;

    const signatureHelp = new vscode.SignatureHelp();
    const signatureInformation = new vscode.SignatureInformation(data.label);
  
    signatureHelp.signatures = [
        signatureInformation
    ]
    return signatureHelp;
}
module.exports = {
    getErrors,
    getHoverItems,
    getSnippetItems,
    getSignatures
}