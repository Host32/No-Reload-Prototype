/*global module*/
(function () {
    'use strict';

    function escapeGroup(group) {
        return group.replace(/([=!:$\/()])/g, '\\$1');
    }

    function pathtoRegexp(path) {
        var keys = [],
            index = 0,
            PATH_REGEXP = new RegExp([
                '(\\\\.)',
                '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
                '([.+*?=^!:${}()[\\]|\\/])'
            ].join('|'), 'g');

        // Alter the path string into a usable regexp.
        path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
            // Avoiding re-escaping escaped characters.
            if (escaped) {
                return escaped;
            }

            // Escape regexp special characters.
            if (escape) {
                return '\\' + escape;
            }

            var repeat = suffix === '+' || suffix === '*',
                optional = suffix === '?' || suffix === '*';

            if (!key) {
                index += 1;
            }
            keys.push({
                name: key || index,
                delimiter: prefix || '/',
                optional: optional,
                repeat: repeat
            });

            // Escape the prefix character.
            prefix = prefix ? '\\' + prefix : '';

            // Match using the custom capturing group, or fallback to capturing
            // everything up to the next slash (or next period if the param was
            // prefixed with a period).
            capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

            // Allow parameters to be repeated more than once.
            if (repeat) {
                capture = capture + '(?:' + prefix + capture + ')*';
            }

            // Allow a parameter to be optional.
            if (optional) {
                return '(?:' + prefix + '(' + capture + '))?';
            }

            // Basic parameter support.
            return prefix + '(' + capture + ')';
        });

        return {
            regExp: new RegExp('^' + path + '$'),
            keys: keys
        };
    }

    module.exports = {
        pathtoRegexp: pathtoRegexp
    };
}());
