var NoReload = (function ($) {
    'use strict';
    var serverAddress = '';
    var initialRoute = 'home';
    var lastRoute = initialRoute;

    var reloadPolicy = {
        USE_RESPONSE: 0,
        NEW_REQUEST: 1
    };
    var selectedReloadPolicy = 0;

    var preLoadEvents = {};
    var posLoadEvents = {};

    // The main path matching regexp utility.
    var PATH_REGEXP = new RegExp([
        '(\\\\.)',
        '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
        '([.+*?=^!:${}()[\\]|\\/])'
    ].join('|'), 'g');

    var utils = {
        objectMerge: function (ob1, ob2) {
            for (var key in ob2) {
                ob1[key] = ob2[key];
            }
            return ob1;
        },
        convertResponse: function (response) {
            if (typeof response === 'string')
                response = JSON.parse(response);

            return response;
        }
    };

    var preLoad = function () {
        for (var key in preLoadEvents) {
            preLoadEvents[key]();
        }
    };
    var posLoad = function () {
        for (var key in posLoadEvents) {
            posLoadEvents[key]();
        }
    };

    var ajax = {
        formatUrl: function (location) {
            return serverAddress + location;
        },
        defaultErrorFunction: function () {
            throw "Ajax Error";
        },
        beforeSend: function () {},
        complete: function () {},
        run: function (method, url, success) {
            url = this.formatUrl(url);
            var a = this;
            $.ajax({
                type: method,
                url: url,
                success: success,
                cache: false,
                contentType: "application/json",
                dataType: "json",
                beforeSend: a.beforeSend,
                complete: a.complete,
                error: function (params) {
                    ajax.defaultErrorFunction(params);
                }
            });
        }
    };

    var controllers = {
        registredControllers: {},
        registerController: function (name, controller) {
            this.registredControllers[name] = controller;
        },
        defaultResponseProcessor: function () {
            return true;
        },
        call: function (controllerFunc, params) {
            if (typeof controllerFunc === 'string')
                controllerFunc = this.getControllerFunc(controllerFunc);

            controllerFunc(params);
        },
        getControllerFunc: function (name) {
            var c = this;
            return function (params) {
                var names = name.split(';');
                for (var key in names) {
                    var scope = c.registredControllers;
                    var scopeSplit = name.split('.');
                    for (var i = 0; i < scopeSplit.length - 1; i++) {
                        scope = scope[scopeSplit[i]];

                        if (scope == undefined) break;
                    }
                    if (scope[scopeSplit[scopeSplit.length - 1]] == undefined) continue;
                    scope[scopeSplit[scopeSplit.length - 1]](params);
                }
            };
        },
        getControllerValue: function (name) {
            var scope = this.registredControllers;
            var scopeSplit = name.split('.');
            for (var i in scopeSplit) {
                scope = scope[scopeSplit[i]];

                if (scope == undefined) return null;
            }
            return scope;
        },
        setControllerValue: function (name, value) {
            var scope = this.registredControllers;
            var scopeSplit = name.split('.');
            for (var i = 0; i < scopeSplit.length - 1; i++) {
                scope = scope[scopeSplit[i]];

                if (scope == undefined) throw 'Scope ' + name + ' has not found in registred controllers';
            }
            scope[scopeSplit[scopeSplit.length - 1]] = value;
        }
    };

    var routes = {
        registredRoutes: {},
        registerRoute: function (route, controller, isAjax) {
            if (typeof isAjax === 'undefined')
                isAjax = true;

            var routeReg = this.pathtoRegexp(route);
            this.registredRoutes[route] = {
                regExp: routeReg.regExp,
                routeParams: routeReg.keys,
                controller: controller,
                isAjax: isAjax
            };
        },
        find: function (route) {
            for (var key in this.registredRoutes) {
                var regExp = this.registredRoutes[key].regExp;
                if (regExp.test(route)) {
                    return {
                        definition: this.registredRoutes[key],
                        matches: route.match(regExp)
                    };
                }
            }
            return false;
        },
        escapeGroup: function (group) {
            return group.replace(/([=!:$\/()])/g, '\\$1');
        },
        pathtoRegexp: function (path) {
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
        }
    };

    function isAjax(routeDef, params) {
        return routeDef.definition.isAjax && (selectedReloadPolicy === reloadPolicy.NEW_REQUEST || typeof params === 'undefined');
    }

    var __export__ = {
        reloadPolicy: reloadPolicy,
        preLoad: preLoad,
        posLoad: posLoad,
        utils: utils,
        ajax: ajax,
        controllers: controllers,
        routes: routes,
        startAnchorNavigation: function () {
            $(window).on('hashchange', function () {
                var name = location.hash.replace(/^#/, '');
                this.load(name);
            });
        },
        registerRoute: function (name, controller, isAjax) {
            routes.registerRoute(name, controller, isAjax);
        },
        isRegistredRoute: function (name) {
            return routes.find(name) !== false;
        },
        registerController: function (name, controller) {
            controllers.registerController(name, controller);
        },
        registerPreLoadEvent: function (name, event) {
            preLoadEvents[name] = event;
        },
        unregisterPreLoadEvent: function (name) {
            delete preLoadEvents[name];
        },
        registerPosLoadEvent: function (name, event) {
            posLoadEvents[name] = event;
        },
        unregisterPosLoadEvent: function (name) {
            delete preLoadEvents[name];
        },
        load: function (route, params) {
            var routeDef = routes.find(route);
            var NR = this;
            if (routeDef) {
                if (isAjax(routeDef, params)) {
                    ajax.run('get', route, function (response) {
                        response.route = routeDef;
                        NR.safeCallControllersWithLoad(routeDef.definition.controller, response);
                    });
                } else {
                    params.route = routeDef;
                    NR.safeCallControllersWithLoad(routeDef.definition.controller, params);
                }
                lastRoute = route;
            } else if (routes.find(initialRoute)) {
                NR.loadState(initialRoute);
            } else {
                throw "the route '" + route + "' has not yet been registered";
            }
        },
        safeCallControllersWithLoad: function (controller, params) {
            this.preLoad();
            this.safeCallControllers(controller, params);
            this.posLoad();
        },
        safeCallControllers: function (controller, params) {
            if (controllers.defaultResponseProcessor(params)) {
                controllers.call(controller, params);
            }
        },
        send: function (type, location, data, callback, reload) {
            callback = callback || false;
            reload = reload || false;

            $.ajax({
                type: type,
                url: ajax.formatUrl(location),
                data: data,
                contentType: "application/json",
                dataType: "json",
                beforeSend: ajax.beforeSend,
                complete: ajax.complete,
                success: function (response) {
                    if (controllers.defaultResponseProcessor(response)) {
                        if (callback) {
                            NR.safeCallControllers(callback, response);
                        }
                        if (reload === true) {
                            NR.load(lastRoute, response);
                        } else if (reload) {
                            NR.load(reload, response);
                        }
                    }
                }
            });
        },
        setControllerValue: function (name, value) {
            controllers.setControllerValue(name, value);
        },
        getControllerValue: function (name) {
            return controllers.getControllerValue(name);
        },
        getCurrentRoute: function () {
            return lastRoute;
        },
        setDefaultErrorFunction: function (func) {
            ajax.defaultErrorFunction = func;
        },
        setDefaultResponseProcessor: function (func) {
            controllers.defaultResponseProcessor = func;
        },
        getServerAddress: function () {
            return serverAddress;
        },
        setServerAddress: function (address) {
            serverAddress = address;
        },
        getInitialRoute: function () {
            return initialRoute;
        },
        setInitialRoute: function (state) {
            initialRoute = state;
        },
        setReloadPolicy: function (policy) {
            selectedReloadPolicy = policy;
        }
    };

    return __export__;
})(jQuery);

var NR = NoReload;