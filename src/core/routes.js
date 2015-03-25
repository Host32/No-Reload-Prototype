module.exports = function () {

    // The main path matching regexp utility.
    var PATH_REGEXP = new RegExp([
        '(\\\\.)',
        '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
        '([.+*?=^!:${}()[\\]|\\/])'
    ].join('|'), 'g');

    this.registredRoutes = {};
    this.register = function (params) {
        if (params.route === undefined)
            throw 'invalid route name';
        if (params.controller === undefined)
            throw 'invalid route controller';

        if (params.ajax === undefined)
            params.ajax = true;

        var alias = params.alias || params.route;

        var routeReg = this.pathtoRegexp(alias);
        this.registredRoutes[alias] = {
            route: params.route,
            regExp: routeReg.regExp,
            params: routeReg.keys,
            controller: params.controller,
            ajax: params.ajax
        };
    };
    this.isRegistred = function (name) {
        return this.find(name) !== false;
    };
    this.find = function (name) {
        for (var key in this.registredRoutes) {
            var route = this.registredRoutes[key];
            if (route.regExp.test(name)) {
                var matches = name.match(route.regExp);

                for (var key2 in route.keys) {
                    matches[route.keys[key2]] = matches[key2];
                }

                return {
                    definition: route,
                    matches: matches
                };
            }
        }
        return false;
    };
    this.escapeGroup = function (group) {
        return group.replace(/([=!:$\/()])/g, '\\$1');
    };
    this.pathtoRegexp = function (path) {
        var keys = [];
        var index = 0;

        var r = this;

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

            var repeat = suffix === '+' || suffix === '*';
            var optional = suffix === '?' || suffix === '*';

            keys.push({
                name: key || index++,
                delimiter: prefix || '/',
                optional: optional,
                repeat: repeat
            });

            // Escape the prefix character.
            prefix = prefix ? '\\' + prefix : '';

            // Match using the custom capturing group, or fallback to capturing
            // everything up to the next slash (or next period if the param was
            // prefixed with a period).
            capture = r.escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

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
    };
};