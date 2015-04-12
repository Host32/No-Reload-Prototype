/**
 * Routes manage class
 */
var Routes = function () {
    'use strict';
    var routes = this,
        registered = {};

    /**
     * Register a Route
     * @param {object} route - Route options.
     * @param {string} route.path - The server URI to which the route points,
     *                              if an alias is not informed, this will be the name
     *                              by which the route is found.
     * @param {(Object|string)} route.template - The ractive that will be responsible for
     *                                           handling route requests, if it is a string,
     *                                           it will be assumed that it is the url of the template.
     * @param {string} route.template.url - The url for which the framework should seek the template file
     * @param {Object} [route.model] - The object that will be passed as data to ractive,
     *                                 its constructor receives the response from the server as parameter.
     * @param {string} [route.alias=route.path] - The name by which the route is called
     * @param {string} [route.type=ajax] - The type of route, can be 'ajax', 'static' or 'websocket'
     */
    this.register = function (route) {
        var alias = route.alias || route.path || route.route,

            routeReg = this.pathtoRegexp(alias),

            type = route.type || 'ajax';
        if (route.ajax !== undefined && !route.ajax) {
            type = 'static';
        }

        registered[alias] = {
            path: route.path || route.route,
            regExp: routeReg.regExp,
            keys: routeReg.keys,
            type: type,
            model: route.model,
            template: route.template,
            controller: route.controller
        };
    };

    this.find = function (path) {
        var key, route;

        for (key in registered) {
            if (registered.hasOwnProperty(key)) {
                route = registered[key];
                if (route.regExp.test(path)) {
                    return routes.createRouteObject(route, path);
                }
            }
        }
        return null;
    };


    /**
     * Create a route description object from a route and a path
     * @param   {Object} route      registered Route
     * @param   {String} calledPath path called from a `load`
     * @returns {Object} route description
     */
    this.createRouteObject = function (route, calledPath) {
        'use strict';
        var matches = calledPath.match(route.regExp),
            routePath = route.path,
            replace,
            matchedKey,
            key;

        for (key in route.keys) {
            if (route.keys.hasOwnProperty(key)) {
                matchedKey = parseInt(key, 10) + 1;
                matches[route.keys[key].name] = matches[matchedKey];
                replace = matches[matchedKey] || '';
                routePath = routePath.replace(":" + route.keys[key].name, replace);
            }
        }

        return {
            definition: route,
            matches: matches,
            path: routePath
        };
    };

    this.isRegistered = function (path) {
        var key, route;

        for (key in registered) {
            if (registered.hasOwnProperty(key)) {
                route = registered[key];
                if (route.regExp.test(path)) {
                    return true;
                }
            }
        }
        return false;
    };
};

Routes.prototype.PATH_REGEXP = new RegExp([
    '(\\\\.)',
    '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
    '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

Routes.prototype.escapeGroup = function (group) {
    'use strict';
    return group.replace(/([=!:$\/()])/g, '\\$1');
};

Routes.prototype.pathtoRegexp = function (path) {
    'use strict';
    var keys = [],
        index = 0;

    // Alter the path string into a usable regexp.
    path = path.replace(Routes.PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
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
        capture = Routes.escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

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

/*global module*/
module.exports = Routes;
