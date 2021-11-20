const vscode = require('vscode');
const { parseAbiFunctions, parsePrivateFunctions } = require("./parser");

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
    let snippetPath = path.resolve(__dirname, `snippets/includes/${name}.md`);
    return fs.readFileSync(snippetPath, "utf8");
}

function getSnippetType(body) {
    if (body.match(/(debot|AddressInput|AmountInput|Base64|ConfirmInput|CountryInput|DateTimeInput|EncryptionBoxInput|Hex|JsonDeserialize|Media|Menu|Network|NumberInput|QRCode|Query|Sdk|SecurityCardManagement|SigningBoxInput|Terminal|UserInfo)/)) {
        return vscode.CompletionItemKind.Interface;
    }
    if (body.match(/\b(TvmCell|TvmSlice|TvmBuilder|ExtraCurrencyCollection|address|array|vector|Type|string\d*|bytes\d*|bytes|byte|int\d*|uint\d*|bool|hash\d*)\b/)) {
        return vscode.CompletionItemKind.Variable;
    }
    if (body.match(/QueryCollection|SortDirection|QueryStatus/)) { return vscode.CompletionItemKind.Enum; }
    if (body.match(/QueryOrderBy/)) { return vscode.CompletionItemKind.Struct; }

    if (body.match(/\b(pragma|static|functionID|externalMsg|internalMsg|inline|constant|public|external|responsible|virtual|override|now)\b/)) {
        return vscode.CompletionItemKind.Keyword;
    }
    if (body.match(/\b(enum)\b/)) { return vscode.CompletionItemKind.Enum; }
    if (body.match(/\b(struct)\b/)) { return vscode.CompletionItemKind.Struct; }
    if (body.match(/\b(event)\b/)) { return vscode.CompletionItemKind.Struct; }
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

function checkParam(find, str) {
    const re = new RegExp(`${find}$`);
    return str.match(re);
}
function getErrorLenght(errorString) {
    if (!errorString) return null;

    let errorStringCounter = errorString.match(/[\^]/g);
    if (errorStringCounter == null) {
        return null;
    }
    return errorStringCounter.length;
}

function getErrorFilePath(string) {
    let filePath = string.match(/\s([\w\.\/]+\.sol):/);
    if (filePath == null || !filePath[1]) return null;

    if (fs.existsSync(filePath[1])) {
        return filePath[1];
    }
    return vscode.window.activeTextEditor.document.uri.fsPath;
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
        let coord = value[1] ? value[1].match(/\d+:\d+/) : null;
        if (coord !== null) coord = coord[0].split(":");
        let severity = value[0].match(/Warning/) ? 'Warning' : 'Error';
        let raw = !coord ? null : Number(coord[0]);
        let position = !coord ? null : Number(coord[1]);
        let errorLenght = getErrorLenght(value[4]);
        let source = vscode.Uri.file(getErrorFilePath(value.join("\n")));
        return {
            info: value[0],
            coord: {
                raw,
                position
            },
            errorLenght,
            severity,
            source
        }
    })

}

function getHoverItems(word, document) {
    let abiFunctions = highliteIt(parseAbiFunctions(document));
    let privateFunctions = highliteIt(parsePrivateFunctions(document))

    let wordsHover = { ...wordsSetHover, ...abiFunctions, ...privateFunctions };
    let suggestion = null;
    let counter = 0;
    let name = word.match(/AbiHeader|msgValue|pragma|(ton-)?solidity|push/);
    if (name) {
        return getSnippetsIncludes(name[0]);
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
    let completions = { ...parseAbiFunctions(document), ...parsePrivateFunctions(document), ...wordsSetCompletion() };
    let filtered = filterSnippets(word, completions);
    let completionItems = [];
    for (const [key, value] of Object.entries(filtered)) {
        const completionItem = new vscode.CompletionItem(value.prefix, getSnippetType(value.body.split("\n")[0]));
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
    let funcs = { ...parseAbiFunctions(document), ...parsePrivateFunctions(document), ...wordsSetCompletion() };
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