function findNodeByPosition(ast, position) {
    if (Array.isArray(ast)) {
        return arrayIterator(ast, position)
    }
}

function arrayIterator(arr, position) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null && typeof arr[i] === 'object') {
            const node = objectIterator(arr[i], position);
            if (node) {
                return node;
            }
        }
    }
}

function objectIterator(obj, position) {
    if (obj !== null && typeof obj.src !== 'undefined' && inRange(obj.src, position) == false) {
        return;
    }
    if (typeof obj.referencedDeclaration !== 'undefined') {
        return obj;
    }
    for (let k in obj) {
        if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            let node = objectIterator(obj[k], position);
            if (node) {
                return node;
            }
        }
        if (Array.isArray(obj[k])) {
            let node = arrayIterator(obj[k], position)
            if (node) {
                return node;
            }
        }
    }
}

function inRange(astPosition, position) {
    const src = astPosition.split(":");
    const start = Number(src[0]);
    const end = Number(src[1]) + start;
    if (position >= start && position <= end) {
        return true;
    }

    return false;
}

module.exports = {
    findNodeByPosition
}