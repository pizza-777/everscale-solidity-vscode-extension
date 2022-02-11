function findNodeById(ast, id) {
    if (Array.isArray(ast)) {
        return arrayIterator(ast, id)
    }
}

function arrayIterator(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null && typeof arr[i] === 'object') {
            let node = objectIterator(arr[i], id);
            if (node) {
                return node;
            }
        }
    }
}

function objectIterator(obj, id) {
    if (obj !== null && typeof obj.id !== 'undefined' && obj.id == id) {
        return obj;
    }

    for (let k in obj) {
        if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            let node = objectIterator(obj[k], id);
            if (node) {
                return node;
            }
        }
        if (Array.isArray(obj[k])) {
            let node = arrayIterator(obj[k], id)
            if (node) {
                return node;
            }
        }
    }
}

module.exports = {
    findNodeById
}