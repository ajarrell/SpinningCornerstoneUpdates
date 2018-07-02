/**
 * A functional JavaScript library -- composition, currying, polyfills and performance.
 *
 * Copyright Lansana Camara, 2016
 * @license MIT
 */




/*
 |--------------------------------------------------------------------------------------------------------
 | Variables
 |--------------------------------------------------------------------------------------------------------
 */

// Object#toString result shortcuts
const objectTag = '[object Object]';
const arrayTag = '[object Array]';
const stringTag = '[object String]';
const functionTag = '[object Function]';
const numberTag = '[object Number]';
const booleanTag = '[object Boolean]';

// Used for native method references
const objectProto = Object.prototype;

// Native method shortcuts
const hasOwnProperty = objectProto.hasOwnProperty;
const toString = objectProto.toString;

// Assignable DOM node attributes map
const assignableDOMNodeAttributes = {
    value: true,
    innerText: true,
    innerHTML: true
};

// Hash table for checking is an attribute is an assignable DOM node attribute
const isAssignableDOMNodeAttribute = attr => assignableDOMNodeAttributes[attr];

// Useful ternary helper
const noop = () => {
    // No operations
};




/*
 |--------------------------------------------------------------------------------------------------------
 | Aliases
 |--------------------------------------------------------------------------------------------------------
 |
 | These aliases are just meant to replace the name of certain functions. For example,
 | instead of `reduce`, one could use `foldl` if coming from a functional programming
 | language like Haskell and `foldl` is what they're used to.
 */

const forEach = each;
const forEachRight = eachRight;
const foldl = reduce;
const foldr = reduceRight;




/*
 |--------------------------------------------------------------------------------------------------------
 | Private functions
 |--------------------------------------------------------------------------------------------------------
 |
 | These functions are used as helpers and/or to keep the rest of the DRY. For example,
 | `each` and `eachRight` follow the same logic with minor differences (i.e., iterate
 | from right to left instead of left to right). `_createEach` allows us to keep that logic
 | in one place.
 */

/**
 * Compose a new function of the result of calling the argument
 *
 * @private
 * @param functions {Array}    An array of functions to compose
 * @param dir       {Number}   Specify iterating from right to left
 * @returns         {Function} The composed function
 */
function _createCompose(functions, dir) {
    if (dir > 0) {
        functions = map(functions, f => f).reverse();
    }

    return val => reduce(functions, (prevVal, currFunc) => {
        return currFunc(prevVal);
    }, val);
}

/**
 * Loops over `iterable` and calls `iteratee` on each item in `iterable`
 *
 * @private
 * @param iterable {Array|Object} The array or object to loop over
 * @param iteratee {Function}     The function to call on each item in `iterable`. Return false to break loop.
 * @param dir      {Number}       Less than 0 for left to right, greater than 0 for right to left
 */
function _createEach(iterable, iteratee, dir) {
    if (isArrayLike(iterable)) {
        let len = iterable ? iterable.length : 0,
            i = dir > 0 ? len : -1;

        while (dir > 0 ? --i >= 0 : ++i < len) {
            if (iteratee(iterable[i], i, iterable) === false) {
                break;
            }
        }
    } else if (isNumber(iterable)) {
        let i = -1;

        while (++i < iterable) {
            if (iteratee() === false) {
                break;
            }
        }
    } else {
        let _keys = keys(iterable),
            len = _keys.length,
            i = dir > 0 ? len : -1;

        while (dir > 0 ? --i >= 0 : ++i < len) {
            if (iteratee(iterable[_keys[i]], _keys[i], iterable) === false) {
                break;
            }
        }
    }
    return iterable;
}

/**
 * Recursive quicksort implementation on arrays
 *
 * @param   array {Array} The array to sort
 * @returns       {Array} An array sorted alphabetically or numerically
 * @private
 */
function _rqsort(array) {
    const len = array ? array.length : 0;

    if (len < 2) {
        return array
    }

    let i = -1,
        pivotIndex = Math.floor(rand(0, len)),
        pivot = array[pivotIndex],
        less = [],
        more = [],
        sorted = [];

    while (++i < len) {
        if (i !== pivotIndex) {
            array[i] > pivot ? more[more.length] = array[i] : less[less.length] = array[i];
        }
    }

    return concat(sorted, _rqsort(less), _rqsort([pivot]), _rqsort(more));
}

/**
 * Sort an array by the logic of a comparison function
 *
 * @example
 *
 * const arr = [5, 2, 3, 1, 4, 7];
 * sort(arr, (a, b) => a - b);
 * // [1, 2, 3, 4, 5, 7]
 *
 * const obj = [{name: 'Foo', age: 20}, {name: 'Bar', age: 21}, {name: 'Baz', age: 22}];
 * sort(obj, (a, b) => {
 *      let nameA = a.name;
 *      let nameB = b.name;
 *      return nameA > nameB ? 1 : -1;
 * });
 * // [{name:'Bar', age:21}, {name:'Baz', age:22}, {name:'Foo', age:20}]
 *
 * @param array    {Array}    The array to sort
 * @param iteratee {Function} A function that defines the sort order. If omitted, array is sorted based on
 *                            each characters unicode value
 * @returns        {Array}    The sorted array
 * @private
 */
function _rqcsort(array, iteratee) {
    const len = array ? array.length : 0;

    if (len < 2) {
        return array;
    }

    let i = -1,
        pivotIndex = Math.floor(rand(0, len)),
        pivot = array[pivotIndex],
        less = [],
        more = [],
        sorted = [];

    while (++i < len) {
        if (i !== pivotIndex) {
            let result = iteratee(array[i], pivot);
            result > 0 ? more[more.length] = array[i] : less[less.length] = array[i];
        }
    }

    return concat(sorted, _rqcsort(less, iteratee), _rqcsort([pivot], iteratee), _rqcsort(more, iteratee));
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Composition
 |--------------------------------------------------------------------------------------------------------
 |
 |
 */

/**
 * Follows the natural behavior of `_createCompose`
 *
 * @example
 *
 * let add2 = num => num + 2;
 * let times2 = num => num * 2;
 * let divide2 = num => num / 2;
 * let subtract2 = num => num - 2;
 * let math = compose(add2, times2, divide2, subtract2);
 *
 * math(5)
 * // 5
 *
 * math(100)
 * // 100
 *
 * math(100000)
 * // 100000
 *
 * @param functions {Function} A letiable number of functions to compose
 * @returns         {Function} The composed function
 */
function compose(...functions) {
    return _createCompose(functions, -1);
}

/**
 * Specialized version of `_createCompose` (loops from right to left)
 *
 * @example
 *
 * let add2 = num => num + 2;
 * let times2 = num => num * 2;
 * let divide2 = num => num / 2;
 * let subtract2 = num => num - 2;
 * let math = compose(add2, times2, divide2, subtract2);
 *
 * math(5)
 * // 5
 *
 * math(100)
 * // 100
 *
 * math(100000)
 * // 100000
 *
 * @param functions {Function} A letiable number of functions to compose
 * @returns         {Function} The composed function
 */
function composeRight(...functions) {
    return _createCompose(functions, 1);
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Collections
 |--------------------------------------------------------------------------------------------------------
 */

/**
 * Loops over `collection` from left to right and calls `iteratee` on each item
 *
 * @param iterable {Array|Object} The array or object to loop over
 * @param iteratee {Function}     Callback function to be applied on each iteration
 */
function each(iterable, iteratee) {
    return _createEach(iterable, iteratee, -1);
}

/**
 * Loop array starting from the right (start at index obj.length - 1), and apply
 * a function on each element
 *
 * @param iterable {Array|Object} The array to loop over
 * @param iteratee {Function}     Function to be applied on each item
 */
function eachRight(iterable, iteratee) {
    return _createEach(iterable, iteratee, 1);
}

/**
 * Create a reducing function iterating from left to right
 *
 * @param array    {Array}    The array to loop over
 * @param iteratee {Function} The function to apply on each element in `array`
 * @param memo     {*}        The value that is accumulated from the return value of each iteratee
 * @returns        {*}
 */
function reduce(array, iteratee, memo) {
    if (array.reduce) {
        if (isUndefined(memo)) {
            return array.reduce(iteratee)
        }

        return array.reduce(iteratee, memo);
    }

    if (isUndefined(memo)) {
        memo = array.shift();
    }

    each(array, (elem, index, list) => {
        memo = iteratee(memo, elem, index, list);
    });

    return memo;
}

/**
 * Follows the natural behavior of `reduce`, but iterates from right to left
 *
 * @param array    {Array}    The array to loop over in reverse
 * @param iteratee {Function} The function to apply on each item in `array`
 * @param memo     {*}        The value that is accumulated from the return value of each `iteratee`
 * @returns        {*}        The value in `memo` after having reduced each item in `array`
 */
function reduceRight(array, iteratee, memo) {
    let reversed = map(array, elem => elem).reverse();

    return reduce(reversed, iteratee, memo);
}

/**
 * Create a new array with the results of applying a function on each element
 *
 * @param array    {Array}    The array to loop over
 * @param iteratee {Function} The callback function to apply on each element
 * @returns        {Array}    The new array created
 */
function map(array, iteratee) {
    if (array.map) {
        return array.map(iteratee);
    }

    let results = new Array(array.length);

    each(array, (elem, index, list) => {
        results[index] = iteratee(elem, index, list);
    });

    return results;
}

/**
 * Create a new array with all the elements that passed a test implemented by
 * the `predicate` function
 *
 * @param collection {Array}    The array to loop over
 * @param predicate  {Function} The test to apply on each item on `array`. Args: (value, index|key, collection)
 * @returns          {Array}    An array of elements `predicate` returned true for
 */
function filter(collection, predicate) {
    if (collection.filter) {
        return collection.filter(predicate);
    }

    let results = [];

    each(collection, (elem, index, list) => {
        if (predicate(elem, index, list)) {
            results.push(elem);
        }
    });

    return results;
}

/**
 * fjs.partition returns an array of two arrays. The first array is all items that return true for `predicate`,
 * the second array is all items that return false for `predicate`
 *
 * @example
 *
 * const even = num => num % 2 === 0;
 *
 * partition([1, 2, 3, 4, 5, 6, 7], even);
 * // [[2, 4, 6], [1, 3, 5, 7]]
 *
 * @param collection {Array|Object} The collection to partition
 * @param predicate  {Function}     The function that determines the partitioning
 * @returns          {Array}        An array containing two arrays. One, elements that pass `predicate`, two, elements
 *                                  that fail `predicate`.
 */
function partition(collection, predicate) {
    let passed = [],
        failed = [];

    each(collection, (elem, index, list) => {
        if (predicate(elem, index, list)) {
            passed[passed.length] = elem;
        } else {
            failed[failed.length] = elem;
        }
    });

    return [passed, failed];
}

/**
 * Extracts a list of property values for a given property name from objects in an array.
 *
 * @example
 *
 * let arr = [
 *      {name: 'Foo', age: 1},
 *      {name: 'Bar', age: 2},
 *      {name: 'Baz', age: 3}
 * ]
 *
 * pluck('name')(arr)
 * // ['Foo', 'Bar', 'Baz']
 *
 * pluck('age')(arr)
 * // [1, 2, 3]
 *
 * @param propertyName {String}   This is the property name to get values from
 * @returns            {Function} Returns a function that takes an array of objects. The function reduces the
 *                                value at `propertyName` in each object into an array and returns the array.
 */
function pluck(propertyName) {
    return arr => {
        return reduce(arr, (collection, obj) => {
            return concat(collection, obj[propertyName]);
        }, []);
    }
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Arrays
 |--------------------------------------------------------------------------------------------------------
 */

/**
 * Concatenate multiples arrays together
 *
 * Time complexity: O (n^2)
 *
 * @param arrays {Array} An array of arrays, each concatenated to a base (the first array), from left to right.
 * @returns      {Array} A single array containing all the values of all the arrays in `arrays`
 */
function concat(...arrays) {
    let base = arrays.shift();

    if (base.concat) {
        each(arrays, array => {
            base = base.concat(array);
        });
    } else {
        each(arrays, array => {
            each(array, elem => {
                base[base.length] = elem;
            });
        });
    }

    return base;
}

/**
 * Quicksort implementation
 *
 * Time complexity: O (n log n)
 *
 * @private
 * @param array    {Array}    The array to sort. The elements can be any type if you provide `iteratee` for your own
 *                            sort logic, otherwise the elements must be either strings, characters or numbers
 *                            (for unicode evaluation).
 * @param iteratee {Function} Decides the sort order of the array
 * @returns        {Array}    A sorted array
 */
function sort(array, iteratee) {
    if (array.sort) {
        if (isFunction(iteratee)) {
            return array.sort(iteratee);
        }

        return array.sort();
    }

    if (isFunction(iteratee)) {
        return _rqcsort(array, iteratee);
    }

    return _rqsort(array);
}

/**
 * Binary search for the index of `val` in `array`
 *
 * Time complexity: O (log n)
 *
 * @private
 * @param haystack {Array}    The haystack to look for `needle` in
 * @param needle   {*}        The needle to find in `haystack`
 * @param start    {Number}   The index in `array` to start searching
 * @param stop     {Number}   The index in `array` to stop searching
 * @param compare  {Function} This acts as a comparison function with (haystack[guess], needle) as arguments.
 *                            This allows custom comparisons (maybe using objects and need to access by property).
 *                            Return 1 if (guess > needle), 0 if (guess === needle), -1 if (guess < needle)
 * @returns        {*}        The index at which `val` is in `array`, or -1 if not found
 */
function indexOf(haystack, needle, start, stop, compare) {
    if (start > stop) {
        return -1;
    }

    let mid = (start + stop) >>> 1;

    if (isFunction(compare)) {
        const result = compare(haystack[mid], needle);

        if (result === 0) {
            return mid;
        } else if (result === 1) {
            return indexOf(haystack, needle, start, mid - 1, compare);
        } else if (result === -1) {
            return indexOf(haystack, needle, mid + 1, stop, compare);
        }
    } else {
        if (haystack[mid] === needle) {
            return mid;
        } else if (haystack[mid] > needle) {
            return indexOf(haystack, needle, start, mid - 1);
        } else if (haystack[mid] < needle) {
            return indexOf(haystack, needle, mid + 1, stop);
        }
    }
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Objects
 |--------------------------------------------------------------------------------------------------------
 */

/**
 * Check if object has key as own property.
 *
 * @param obj {Object}  Check if `obj` has an own property of `key`
 * @param key {String}  The key to check
 * @returns   {boolean} True or false
 */
function has(obj = {}, key) {
    return hasOwnProperty.call(obj, key);
}

/**
 * Get the an array of the keys of an object
 *
 * @param obj {Object} The object to get the keys from
 * @returns   {Array}  An array of strings containing the key values of `obj`
 */
function keys(obj) {
    if (Object.keys) {
        return Object.keys(obj);
    } else if (!isObject(obj)) {
        return [];
    }

    let _keys = [];

    each(obj, (val, key) => {
        _keys.push(key);
    });

    return _keys;
}

/**
 * Call a function on each item on an object. Similar to `map` in that `iteratee` is called o.
 * each key in the object, however a new object is returned as opposed to a new array.
 *
 * @example
 *
 * let numbers = {one: 1, two: 2, three: 3, four: 4}
 *
 * mapObject(numbers, (val, key, obj) => obj[key] += 1)
 * // {one: 2, two: 3, three: 4, four: 5}
 *
 * @param obj      {Object}
 * @param iteratee {Function}
 * @returns        {Object}
 */
function mapObject(obj, iteratee) {
    let resultObj = {};

    each(keys(obj), key => {
        resultObj[key] = iteratee(obj[key], key, obj);
    });

    return resultObj;
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Strings
 |--------------------------------------------------------------------------------------------------------
 */

/**
 * Determine whether a value is within a string, or whether a value is within a string
 * at a certain index.
 *
 * @param string     {String}  The string to search
 * @param val        {String}  The value to search for in `string`; Unicode matching
 * @param startIndex {Number}  Optional index to start looking for `val` within `string`
 * @returns          {Boolean} True or false
 */
function includes(string, val, startIndex) {
    if (string.indexOf) {
        if (isNumber(startIndex)) {
            return string.indexOf(val, startIndex) > -1;
        }

        return string.indexOf(val) > -1;
    }

    if (isNumber(startIndex)) {
        return indexOf(string, val, startIndex, string.length) > -1;
    }

    return indexOf(string, val, 0, string.length) > -1;
}

/**
 * Determine whether a string starts with a given value, or whether a value is within the string
 * starting at a certain index.
 *
 * @param string     {String}  The string to search
 * @param val        {String}  The value to search for in `string`; Unicode matching
 * @param startIndex {Number}  Optional index to check if `val` starts there
 * @returns          {Boolean} True or false
 */
function startsWith(string, val, startIndex) {
    if (string.indexOf) {
        if (isNumber(startIndex)) {
            return string.indexOf(val, startIndex) === startIndex;
        }

        return string.indexOf(val) === 0;
    }

    if (isNumber(startIndex)) {
        return indexOf(string, val, startIndex, string.length) === startIndex;
    }

    return indexOf(string, val, 0, string.length) === 0;
}

/**
 * Repeat a string `n` times and return the concatenated result
 *
 * @param string {String} The string to repeat
 * @param n      {Number} The amount of times to repeat the string
 * @returns      {string}
 */
function repeat(string, n) {
    let newString = '';

    each(n, () => {
        newString += string
    });

    return newString;
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Networking
 |--------------------------------------------------------------------------------------------------------
 |
 | These functions are used to manipulate the DOM and work with HTML.
 */

function queryName () {}


/*
 |--------------------------------------------------------------------------------------------------------
 | DOM/HTML
 |--------------------------------------------------------------------------------------------------------
 |
 | These functions are used to manipulate the DOM and work with HTML.
 */

/**
 * Create an element.
 *
 * @example
 *
 * let span = createElement('span', { innerText: 'Hello, world!' });
 *
 * let h1 = createElement('h1', {
 *      class: 'title',
 *      id: 'im-an-h1',
 *      ariaLabel: 'Hello, world!'
 * }, span);
 *
 * // <h1 class="title" id="im-an-h1" aria-label="Hello, world!">
 * //     <span>Hello, world!</span>
 * // </h1>
 *
 * @param type     {String}  The type of element ('h1', 'h2', 'p', 'a', 'div', etc.)
 * @param config   {Object}  An object to configure the element (add text, innerHtml, classes, id, custom attr's, etc.)
 * @param children {Element} A variable number of elements to append as children from left to right
 * @returns        {Element} The newly formed element with all it's configuration/children nodes
 */
function createElement(type, config, ...children) {
    let _el = document.createElement(type);

    each(config, (val, key) => {
        // Native DOM node attributes that need an assignment
        // Ex: node.foo = bar, instead of node.setAttribute(foo, bar);
        if (isAssignableDOMNodeAttribute(key)) {
            _el[key] = config[key];
        }
        // Attributes that don't need an assignment (can be set with `node.setAttribute()`)
        else {
            // Normalize attribute, e.g. ariaLabel => aria-label
            let attr = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

            _el.setAttribute(attr, config[key]);
        }
    });

    each(children, child => {
        if (isElement(child)) _el.appendChild(child);
    });

    return _el;
}

/**
 * Recursive walk on the DOM. Calls an iteratee function on each node.
 *
 * @param node
 * @param iteratee
 */
function walkTheDOM(node, iteratee) {
    iteratee(node);
    node = node.firstChild;

    while (node) {
        walkTheDOM(node, iteratee);
        node = node.nextSibling;
    }
}

/**
 * Kill all event handlers on a given node, and everything beneath/besides it.
 *
 * @param node
 */
function purgeEventHandlers(node) {
    walkTheDOM(node, childNode => {
        for (let prop in childNode) {
            if (isFunction(childNode[prop])) {
                childNode[prop] = null;
            }
        }
    });
}

/**
 * Cross-browser event listener adder.
 *
 * @param target {Element}  The node to attach the event to
 * @param type   {String}   The name of the event
 * @param f      {Function} The callback to be applied on the event
 */
function addEventListener(target, type, f) {
    if (target.addEventListener) {
        target.addEventListener(type, f, false);
    } else if (target.attachEvent) {
        target.attachEvent(`on${type}`, f);
    } else {
        target[`on${type}`] = f;
    }
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------------------------------
 */

/**
 * Get a random number from `min` (included) to `max` (excluded)
 *
 * @param min {Number} The minimum
 * @param max {Number} The maximum
 * @returns   {Number} The random number
 */
function rand(min, max) {
    return Math.random() * (max - min) + min;
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Type Checkers
 |--------------------------------------------------------------------------------------------------------
 |
 | These functions are used to check the type of values.
 */

/**
 * Check if `val` is a DOM element.
 *
 * @example
 *
 * isElement(document.body)
 * // true
 *
 * isElement('<body>')
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isElement(val) {
    return val && val.nodeType === 1;
}

/**
 * Check if `val` is undefined.
 *
 * @example
 *
 * isUndefined(undefined)
 * // true
 *
 * isUndefined(1)
 * // false
 *
 * isUndefined({})
 * // false
 *
 * isUndefined([])
 * // false
 *
 * isUndefined(function(){})
 * // false
 *
 * isUndefined(null)
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isUndefined(val) {
    return typeof val === 'undefined';
}

/**
 * Check if `val` is null.
 *
 * @example
 *
 * isNull(null)
 * // true
 *
 * isNull(undefined)
 * // false
 *
 * isNull(void 0)
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isNull(val) {
    return val === null;
}

/**
 * Check if `val` is a boolean.
 *
 * @example
 *
 * isBoolean(true)
 * // true
 *
 * isBoolean(false)
 * // true
 *
 * isBoolean('hello')
 * // false
 *
 * isBoolean([1, 2, 3])
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isBoolean(val) {
    return val === true || val === false || (isObjectLike(val) && toString.call(val) === booleanTag);
}

/**
 * Check if `val` is a number.
 *
 * @example
 *
 * isNumber(7)
 * // true
 *
 * isNumber('7')
 * // false
 *
 * isNumber(Infinity)
 * // true
 *
 * isNumber(Number.MAX_VALUE)
 * // true
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isNumber(val) {
    return typeof val === 'number' || (isObjectLike(val) && toString.call(val) === numberTag);
}

/**
 * Check if argument is a string.
 *
 * @example
 *
 * isString('hello')
 * // true
 *
 * isString(7)
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isString(val) {
    return typeof val === 'string' || (!isArray(val) && isObjectLike(val) && toString.call(val) === stringTag);
}

/**
 * Check if argument is a function.
 *
 * @example
 *
 * isFunction(function(){})
 * // true
 *
 * isFunction('hello')
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isFunction(val) {
    return typeof val === 'function' && toString.call(val) === functionTag;
}

/**
 * Check if argument is an object.
 *
 * In JavaScript, an array is an object, but we only want to check for objects
 * defined with {}, not [], so we explicitly check for that using objToStr.
 *
 * @example
 *
 * isObject({})
 * // true
 *
 * isObject([1, 2, 3, 4, 5])
 * // false
 *
 * isObject(function(){})
 * // false
 *
 * isObject(null)
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isObject(val) {
    return val === Object(val) && toString.call(val) === objectTag;
}

/**
 * Check if something is object-like
 *
 * @example
 *
 * isObjectLike({})
 * // true
 *
 * isObjectLike([1, 2, 3, 4, 5])
 * // true
 *
 * isObjectLike(function(){})
 * // false
 *
 * isObjectLike(null)
 * // false
 *
 * isObjectLike('hello')
 * // false
 *
 * @param val {*}       The value to check
 * @returns   {Boolean} True or false
 */
function isObjectLike(val) {
    return val !== null && typeof val === 'object';
}

/**
 * Check is `val' is a classified an Array object
 *
 * @example
 *
 * isArray([1, 2, 3, 4, 5])
 * // true
 *
 * isArray(document.body.children)
 * // false
 *
 * isArray(function(){})
 * // false
 *
 * isArray(null)
 * // false
 *
 * isArray('hello')
 * // false
 *
 * @param val {*}       The value to be tested against
 * @returns   {Boolean} If `val` is the right type, return true. Else, false.
 */
function isArray(val) {
    if (Array.isArray) {
        return Array.isArray(val);
    }

    return toString.call(val) === arrayTag;
}

/**
 * Check if `val` is array-like. Values are considered array-like if they aren't a function,
 * has a 'length' property that's greater than or equal to `0` and less than or equal to
 * `Number.MAX_SAFE_INTEGER`.
 *
 * @example
 *
 * isArrayLike([1, 2, 3, 4, 5])
 * // true
 *
 * isArrayLike(document.body.children)
 * // true
 *
 * isArrayLike(function(){})
 * // false
 *
 * isArrayLike(null)
 * // false
 *
 * isArrayLike('hello')
 * // true
 *
 * @param val {*}       The value to check
 * @returns   {Boolean} True or false
 */
function isArrayLike(val) {
    return val !== null && hasLength(val) && !isFunction(val);
}

/**
 * Checks if `val` passes the `isArrayLike` test as well as checks if `val` is an object
 *
 * @example
 *
 * isArrayLikeObject([1, 2, 3, 4, 5])
 * // true
 *
 * isArrayLikeObject(document.body.children)
 * // true
 *
 * isArrayLikeObject(function(){})
 * // false
 *
 * isArrayLikeObject(null)
 * // false
 *
 * isArrayLikeObject('hello')
 * // false
 *
 * @param val {*}       The value to check
 * @returns   {Boolean} True or false
 */
function isArrayLikeObject(val) {
    return isObjectLike(val) && isArrayLike(val);
}

/**
 * Check if something is empty
 *
 * @param obj {Array|Object} The array or object to check
 * @returns   {Boolean}      True if empty, false if not empty
 */
function isEmpty(obj) {
    if (isArrayLike(obj) && (isArray(obj) || typeof obj === 'string' || typeof obj.splice === 'function')) {
        return !obj.length;
    } else {
        let empty = true;
        each(obj, (val, key) => {
            if (has(obj, key)) {
                return empty = false;
            }
        });
        return empty;
    }
}

/**
 * Check if a length property of `val` is a valid length property
 *
 * @param val {*}       The length property to be checked
 * @returns   {Boolean} True or false
 */
function hasLength(val) {
    const len = val.length;
    return isNumber(len) && len > -1 && len % 1 === 0;
}




/*
 |--------------------------------------------------------------------------------------------------------
 | Enjoy
 |--------------------------------------------------------------------------------------------------------
 */

export {

    // Composition
    compose,
    composeRight,

    // Collections
    each,
    forEach,
    eachRight,
    forEachRight,
    reduce,
    foldl,
    reduceRight,
    foldr,
    map,
    filter,
    partition,
    pluck,

    // Arrays
    concat,
    sort,
    indexOf,

    // Objects
    has,
    keys,
    mapObject,

    // Strings
    includes,
    startsWith,
    repeat,

    // Networking
    queryName,

    // DOM/HTML
    createElement,
    walkTheDOM,
    purgeEventHandlers,
    addEventListener,

    // Utilities
    rand,

    // Type/existentialist checkers
    isElement,
    isUndefined,
    isNull,
    isBoolean,
    isNumber,
    isString,
    isFunction,
    isObject,
    isObjectLike,
    isArray,
    isArrayLike,
    isArrayLikeObject,
    isEmpty,
    hasLength,

};
