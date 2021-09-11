const snippetsJson = require("./snippets/hover.json");
const wordsSet = snippetsJson['.source.ton-solidity'];
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

function getSuggestion(word){
    let suggestion = null;
    let counter = 0;
    if(word.match(/AbiHeader|msgValue|pragma|(ton-)?solidity/)){
        let snippetPath = path.resolve(__dirname, "snippets/includes/"+word+".md");
        suggestion = fs.readFileSync(snippetPath,"utf8");
        return suggestion;
    }
    let prefixLength = 0;
    for (const [, value] of Object.entries(wordsSet)) {        
        if (word.includes(value.prefix)){
            //take the most matched value
            if(value.prefix.length < prefixLength){
                continue;
            }
            prefixLength = value.prefix.length;            
            if (Array.isArray(value.description)) {
                suggestion = value.description.join("\n")
            } else {
                suggestion = value.description;
            }
            counter++;
            if(counter == 2){
                let snippetPath = path.resolve(__dirname, "snippets/includes/"+value.prefix.replace(/^\./,'')+".md");
                suggestion = fs.readFileSync(snippetPath,"utf8");
                return suggestion;
            }
        }					
    }
   return suggestion;
}

module.exports = {
    getErrors,
    getSuggestion
}