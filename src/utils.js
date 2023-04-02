const vscode = require('vscode');
const { parseAstData, getAst } = require("./parser");
const { findHoverNode } = require("./ast");
const { astHoverMarkdown } = require("./ast/astHoverMarkdown")
const snippetsJsonHover = require("./snippets/hover.json");
const wordsSetHover = snippetsJsonHover['.source.ton-solidity'];

const fs = require("fs");
const path = require('path');

function wordsSetCompletion() {
    let snippetsPath = path.resolve(__dirname, "snippets/completion.json");
    let snippetsJsonCompletion = JSON.parse(fs.readFileSync(snippetsPath, "utf-8"));
    return snippetsJsonCompletion['.source.ton-solidity'];
}

function formatDescription(description) {
    if (Array.isArray(description)) {
        return description.join("\n")
    }
    return description;
}

function getSnippetsIncludes(name) {
    const snippetPath = path.resolve(__dirname, `snippets/includes/${name}.md`);
    return fs.readFileSync(snippetPath, "utf8");
}

function getSnippetType(body, description, CompletionItemKind = null) {
    if (CompletionItemKind !== null) {
        switch (CompletionItemKind) {
            case 'contract':
                return vscode.CompletionItemKind.Class;
            case 'interface':
                return vscode.CompletionItemKind.Interface;
            case 'variable':
                return vscode.CompletionItemKind.Variable;
            case 'constant':
                return vscode.CompletionItemKind.Constant;
            case 'function':
                return vscode.CompletionItemKind.Function;
        }
    }
    if (body.match(/(debot|AddressInput|AmountInput|Base64|ConfirmInput|CountryInput|DateTimeInput|EncryptionBoxInput|Hex|JsonDeserialize|Media|Menu|Network|NumberInput|QRCode|Query|Sdk|SecurityCardManagement|SigningBoxInput|Terminal|UserInfo)/)) {
        return vscode.CompletionItemKind.Interface;
    }
    if (body.match(/\b(TvmCell|TvmSlice|TvmBuilder|ExtraCurrencyCollection|address|array|vector|Type|string\d*|bytes\d*|bytes|byte|int\d*|varInt\d*|uint\d*|varUint\d*|bool|hash\d*)\b/)) {
        return vscode.CompletionItemKind.Variable;
    }
    if (description == 'variable') {
        return vscode.CompletionItemKind.Variable;
    }
    if (body.match(/QueryCollection|SortDirection|QueryStatus/)) { return vscode.CompletionItemKind.Enum; }
    if (body.match(/QueryOrderBy/)) { return vscode.CompletionItemKind.Struct; }

    if (body.match(/\b(pragma|AbiHeader|static|functionID|externalMsg|internalMsg|inline|constant|public|external|responsible|virtual|override|now)\b/)) {
        return vscode.CompletionItemKind.Keyword;
    }
    if (body.match(/\b(enum|MediaStatus)\b/)) { return vscode.CompletionItemKind.Enum; }
    if (body.match(/\b(struct)\b/)) { return vscode.CompletionItemKind.Struct; }
    if (body.match(/\b(event)\b/)) { return vscode.CompletionItemKind.Struct; }
    if (body.match(/\..*\(/)) return vscode.CompletionItemKind.Method;
    if (body.match(/\.\w+/)) return vscode.CompletionItemKind.Property;
    if (body.match(/\(.*\)/)) return vscode.CompletionItemKind.Function;
    if (body.match(/\b(nano|nanoton|Ton|nTon|ton|micro|microton|milli|milliton|kiloton|kTon|megaton|MTon|gigaton|GTon|nanoever|Ever|ever|micro|microever|milli|milliever|kiloever|kEver|megaever|MEver|gigaever|GEver)\b/)) return vscode.CompletionItemKind.Unit;
    return vscode.CompletionItemKind.Snippet;
}

function checkParam(find, str) {
    const re = new RegExp(`${find}$`);
    return str.match(re);
}
function geterrorLength(errorString) {
    if (!errorString) return null;

    const errorStringCounter = errorString.match(/[\^]/g);
    if (errorStringCounter == null) {
        return null;
    }
    return errorStringCounter.length;
}

function getErrorFilePath(string) {
    const filePath = string.match(/--> (.+?\.t?sol)/);
    if (filePath == null || !filePath[1]) return null;

    if (fs.existsSync(filePath[1])) {
        return path.resolve(filePath[1]);
    }
    return vscode.window.activeTextEditor.document.uri.fsPath;
}

function getErrors(string) {
    if (!string) return;
    string = string.replaceAll("\r\n", "\n");
    let arr = string.split("\n\n");

    let a = arr.map(value => {
        return value.split("\n")
    })

    a = a.filter(value => {
        if (value.length < 5) return false;
        return true;
    })

    return a.map((value) => {
        let coord = value[1] ? value[1].match(/\d+:\d+/) : null;
        if (coord !== null) coord = coord[0].split(":");
        let severity = value[0].match(/Warning/) ? 'Warning' : 'Error';
        let raw = !coord ? null : Number(coord[0]);
        let position = !coord ? null : Number(coord[1]);
        let errorLength = geterrorLength(value[4]);
        if (errorLength == null) {
            //   throw "some technical errors, maybe compiller";
            errorLength = 1;
        }
        let source = vscode.Uri.file(getErrorFilePath(value.join("\n")));
        return {
            info: changeErrorInfo(value[0]),
            coord: {
                raw,
                position
            },
            errorLength,
            severity,
            source
        }
    })
}

function changeErrorInfo(value) {
    if (value.includes('Error: Source file requires different compiler version (current compiler is')) {
        value += '\n\n' + 'Hint. To install needed compiler version run in a command line: `npx everdev sol set --compiler COMPILER_VERSION`'
    }
    return value;
}


function getHoverItems(word, document, position) {
    let suggestion = null;
    let counter = 0;
    let name = word.match(/AbiHeader|msgValue|pragma|(ever-|ton-)?solidity|push|copyleft|oldsol|func(?!tion)/);
    if (name) {
        return getSnippetsIncludes(name[0]);
    }

    function getSuggestions(wordsHover) {
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

    suggestion = getSuggestions(wordsSetHover);

    if (suggestion !== null) return suggestion;


    //like definition provider
    const ast = getAst(document);
    if (ast) {
        const node = findHoverNode(ast, document, position);
        if (node) return astHoverMarkdown(node, ast);
    }
}
function compareSnippetItemsWithWord(snippets, word) {
    return snippets.filter((value) => {
        if (value[1].prefix.includes(word)) {
            return true;
        }
    })
}
function filterSnippets(word, completions) {
    let snippets = Object.entries(completions);
    let filtered = compareSnippetItemsWithWord(snippets, word);
    // try to find methods like variable.tonMethodName
    if (filtered.length == 0) {
        let method = word.match(/(.*)\.(.*)/);
        if (method !== null) {
            filtered = compareSnippetItemsWithWord(snippets, method[2]);
        }
    }
    filtered = filtered.map((value) => {
        if (word.match(/\./) && value[1].body.match(/\./)) {
            let search = `${word.split(".")[0]}.`;
            value[1].body = value[1].body.replace(search, '');
        }
        return value;
    });
    return Object.fromEntries(filtered);
}

function getSnippetItems(document, position) {
    let wordRange = document.getWordRangeAtPosition(position, /[\.\w+]+/);
    const word = document.getText(wordRange);
    let completions = { ...parseAstData(document), ...wordsSetCompletion() };
    let filtered = filterSnippets(word, completions);
    let completionItems = [];
    for (const [key, value] of Object.entries(filtered)) {
        const completionItem = new vscode.CompletionItem(value.prefix, getSnippetType(value.prefix, value.description, value.CompletionItemKind ? value.CompletionItemKind : null));
        completionItem.detail = key;
        completionItem.documentation = formatDescription(value['description']);
        completionItem.insertText = new vscode.SnippetString(value.body);

        completionItems.push(completionItem);
    }
    return completionItems;
}

function getFuncData(funcName, funcs) {
    for (const [, func] of Object.entries(funcs)) {
        if (func.prefix.includes(funcName)) {
            let label = func.body.replace(/(\{|\$|[0-9]:|\\|})/gm, '');
            return { label }
        }
    }
    return null;
}

function getSignatures(document, position) {
    const astData = parseAstData(document);
    const funcs = { ...astData, ...wordsSetCompletion() };
    const line = document.getText(new vscode.Range(new vscode.Position(position.line, 0), new vscode.Position(position.line, position.character)));
    let funcName = line.match(/[_a-zA-Z0-9\.]+(?!.*([_a-zA-Z0-9\.]+)\(){1}/);
    if (funcName == null) return;
    funcName = funcName[0];
    const data = getFuncData(funcName, funcs);
    if (!data) return;

    //get wrote params
    const wordRangeParams = document.getWordRangeAtPosition(position, /\(.*/);
    const currentParams = document.getText(wordRangeParams);

    const signatureHelp = new vscode.SignatureHelp();

    //get signature params
    const paramsString = parseParams(data.label);

    signatureHelp.activeParameter = currentParams.split(",").length - 1;

    const signatureInformation = new vscode.SignatureInformation(data.label);
    signatureInformation.parameters = paramsString.map(param => {
        return { label: param }
    })

    signatureHelp.signatures = [
        signatureInformation
    ]
    return signatureHelp;
}

function parseParams(label) {
    let paramsString = label.match(/\((.*)\)/);
    if (paramsString !== null && typeof paramsString[1] !== 'undefined') {
        return paramsString[1].split(",");
    }
    return [];
}
module.exports = {
    getErrors,
    getHoverItems,
    getSnippetItems,
    getSignatures
}