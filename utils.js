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

function parseVariables(abiFilePath){
   try{
   let abi = require(abiFilePath);
   console.log(abi); 
   }catch(e){
       return;
   }
}

module.exports = {
    getErrors,
    getSuggestion
}
//console.log(getErrors(`Warning: It's deprecated. Consider adding \"pragma ton-solidity ^0.46.0;\" to set a version of the compiler.\n --> SafeMultisigWallet.sol:1:1:\n  |\n1 | pragma solidity >=0.6.0;\n  | ^^^^^^^^^^^^^^^^^^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n --> SafeMultisigWallet.sol:2:1:\n  |\n2 | pragma experimental ABIEncoderV2;\n  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n --> SafeMultisigWallet.sol:9:53:\n  |\n9 |     function acceptTransfer(bytes payload) external payable;\n  |                                                     ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n  --> SafeMultisigWallet.sol:34:17:\n   |\n34 |         address payable dest;\n   |                 ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n   --> SafeMultisigWallet.sol:201:62:\n    |\n201 |     function acceptTransfer(bytes payload) external override payable {\n    |                                                              ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n   --> SafeMultisigWallet.sol:213:17:\n    |\n213 |         address payable dest,\n    |                 ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n   --> SafeMultisigWallet.sol:233:17:\n    |\n233 |         address payable dest,\n    |                 ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n   --> SafeMultisigWallet.sol:409:26:\n    |\n409 |     fallback () external payable {}\n    |                          ^^^^^^^\n\nWarning: Have no effect in TON. Delete this.\n   --> SafeMultisigWallet.sol:411:25:\n    |\n411 |     receive () external payable {}\n    |                         ^^^^^^^\n\nWarning: Source file does not specify required compiler version! Consider adding \"pragma ton-solidity ^0.46.0;\"\n --> SafeMultisigWallet.sol\n\nError: Different number of components on the left hand side (2) than on the right hand side (1).\n   --> SafeMultisigWallet.sol:169:9:\n    |\n169 |         (bool exists, uint8 index) = m_custodians.fetch(senderKey);\n    |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\nError: Type optional(uint8) is not implicitly convertible to expected type bool.\n   --> SafeMultisigWallet.sol:169:9:\n    |\n169 |         (bool exists, uint8 index) = m_custodians.fetch(senderKey);\n    |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\nError: Member \"transLT\" not found or not visible after argument-dependent lookup in tvm.\n   --> SafeMultisigWallet.sol:176:39:\n    |\n176 |         return (uint64(now) << 32) | (tvm.transLT() & 0xFFFFFFFF);\n    |                                       ^^^^^^^^^^^\n\n`));

//parseVariables("./abi/test.abi.json");