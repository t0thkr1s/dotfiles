"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get the nested properties of an object
 * This solution is lighter than the lodash get-version and works fine for the translations.
 * Source: http://stackoverflow.com/a/6491621/6942210
 */
exports.getObjectPropertyValue = (obj, path) => {
    // convert indexes to properties
    path = path.replace(/\[(\w+)\]/g, '.$1');
    // strip a leading dot
    path = path.replace(/^\./, '');
    // separate paths in array
    let pathArray = path.split('.');
    /** Avoid errors in the getValue function. */
    const isObject = (object) => {
        return object === Object(object);
    };
    for (let i = 0; i < pathArray.length; ++i) {
        let k = pathArray[i];
        if (isObject(obj) && k in obj) {
            obj = obj[k];
        }
        else {
            return;
        }
    }
    return obj;
};
/**
 * Set a value for a nested object property.
 * @param obj Object
 * @param path Properties as string e.g. `'a.b.c'`
 * @param value Value to be set for the given property
 * Source: https://stackoverflow.com/a/13719799/6942210
 */
exports.setObjectPropertyValue = (obj, path, value) => {
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (path.length > 1) {
        let e = path.shift();
        exports.setObjectPropertyValue(obj[e] =
            Object.prototype.toString.call(obj[e]) === '[object Object]'
                ? obj[e]
                : {}, path, value);
    }
    else {
        obj[path[0]] = value;
    }
};
//# sourceMappingURL=objects.js.map