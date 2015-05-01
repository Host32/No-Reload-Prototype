/*global module, require*/
(function () {
    'use strict';

    function $UrlResolver() {
        function escapeGroup(group) {
            return group.replace(/([=!:$\/()])/g, '\\$1');
        }

        function createUrlObject(path) {
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

        function extractParams(urlObject, url) {
            var matches = url.match(urlObject.regExp),
                matchedObject = {},
                matchedKey,
                keyIndice,
                key;

            for (keyIndice in urlObject.keys) {
                if (urlObject.keys.hasOwnProperty(keyIndice)) {
                    key = urlObject.keys[keyIndice];
                    matchedKey = parseInt(keyIndice, 10) + 1;
                    matchedObject[key.name] = matches[matchedKey];
                }
            }

            return matchedObject;
        }

        function replaceUrl(params, url) {
            var key;

            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    url = url.replace('{' + key + '}', params[key]);
                }
            }
            return url;
        }

        function resolve(urlObject, url) {
            if (urlObject.regExp.test(url)) {
                var params = extractParams(urlObject, url);
                return {
                    url: replaceUrl(params, url),
                    params: params
                };
            }
            return null;
        }

        return {
            createUrlObject: createUrlObject,
            resolve: resolve,
            replaceUrl: replaceUrl
        };
    }

    module.exports = $UrlResolver;
}());
