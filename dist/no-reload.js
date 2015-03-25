/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var NoReload = __webpack_require__(1);

	window.NR = window.NoReload = new NoReload(jQuery);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Ajax = __webpack_require__(2);
	var Routes = __webpack_require__(3);
	var Modules = __webpack_require__(4);
	var Templates = __webpack_require__(5);
	var WebSocket = __webpack_require__(6);

	module.exports = function ($) {
	    'use strict';
	    var serverAddress = '';
	    var lastRoute = null;

	    var reloadPolicy = {
	        USE_RESPONSE: 0,
	        NEW_REQUEST: 1
	    };
	    var selectedReloadPolicy = 0;

	    var beforeLoadEvents = {};
	    var afterLoadEvents = {};


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

	    var beforeLoad = function () {
	        for (var key in beforeLoadEvents) {
	            beforeLoadEvents[key]();
	        }
	    };
	    var afterLoad = function () {
	        for (var key in afterLoadEvents) {
	            afterLoadEvents[key]();
	        }
	    };

	    var ajax = new Ajax(this, $);
	    var modules = new Modules();
	    var routes = new Routes();
	    var template = new Templates($, Ractive);
	    var ws = new WebSocket();

	    function isAjax(routeDef, params) {
	        return routeDef.definition.ajax && (selectedReloadPolicy === reloadPolicy.NEW_REQUEST || typeof params === 'undefined');
	    }

	    var __export__ = {
	        reloadPolicy: reloadPolicy,
	        beforeLoad: beforeLoad,
	        afterLoad: afterLoad,
	        utils: utils,
	        ajax: ajax,
	        modules: modules,
	        routes: routes,
	        template: template,
	        ws: ws,
	        startAnchorNavigation: function () {
	            var NR = this;
	            $(window).on('hashchange', function () {
	                var name = location.hash.replace(/^#/, '');
	                NR.load(name);
	            });
	        },
	        registerBeforeLoadEvent: function (name, event) {
	            beforeLoadEvents[name] = event;
	        },
	        unregisterBeforeLoadEvent: function (name) {
	            delete beforeLoadEvents[name];
	        },
	        registerAfterLoadEvent: function (name, event) {
	            afterLoadEvents[name] = event;
	        },
	        unregisterAfterLoadEvent: function (name) {
	            delete afterLoadEvents[name];
	        },
	        load: function (route, params) {
	            var routeDef = routes.find(route);
	            var NR = this;
	            if (routeDef) {
	                if (isAjax(routeDef, params)) {
	                    ajax.run({
	                        url: routeDef.definition.route,
	                        type: 'get',
	                        success: function (response) {
	                            response.route = routeDef;
	                            NR.call(routeDef.definition.controller, response);
	                        }
	                    });
	                } else {
	                    if (params !== undefined)
	                        params.route = routeDef;
	                    NR.call(routeDef.definition.controller, params);
	                }
	                lastRoute = route;
	            } else {
	                throw "the route '" + route + "' has not yet been registered";
	            }
	        },
	        call: function (controller, params) {
	            this.beforeLoad();
	            modules.safeCall(controller, params);
	            this.afterLoad();
	        },
	        getCurrentRoute: function () {
	            return lastRoute;
	        },
	        getServerAddress: function () {
	            return serverAddress;
	        },
	        setServerAddress: function (address) {
	            serverAddress = address;
	        },
	        setReloadPolicy: function (policy) {
	            selectedReloadPolicy = policy;
	        }
	    };

	    return __export__;
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (NR, $) {

	    this.getDefaultParams = function (url) {
	        var ajax = this;
	        return {
	            contentType: "application/json",
	            dataType: "json",
	            beforeSend: ajax.beforeSend,
	            complete: ajax.complete,
	            error: ajax.error,
	            cache: false
	        };
	    };
	    this.prepareUrl = function (location) {
	        return NR.getServerAddress() + location;
	    };
	    this.error = function () {
	        throw "Ajax Error";
	    };
	    this.beforeSend = function () {};
	    this.complete = function () {};
	    this.run = function (params) {
	        var url = params.url || '';
	        params.url = this.prepareUrl(url);

	        params = $.extend({}, this.getDefaultParams(url), params);

	        $.ajax(params);
	    };
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function () {
	    this.registred = {};
	    this.register = function (name, module) {
	        this.registred[name] = new module();
	    };
	    this.validator = function () {
	        return true;
	    };
	    this.call = function (moduleFunc, params) {
	        if (typeof moduleFunc === 'string')
	            moduleFunc = this.getFunc(moduleFunc);

	        moduleFunc(params);
	    };
	    this.safeCall = function (module, params) {
	        if (this.validator(params)) {
	            this.call(module, params);
	        }
	    };
	    this.getFunc = function (name) {
	        var c = this;
	        return function (params) {
	            var names = name.split(';');
	            for (var key in names) {
	                var scope = c.registred;
	                var scopeSplit = name.split('.');
	                for (var i = 0; i < scopeSplit.length - 1; i++) {
	                    scope = scope[scopeSplit[i]];

	                    if (scope === undefined) break;
	                }
	                if (scope === undefined || scope[scopeSplit[scopeSplit.length - 1]] === undefined) continue;
	                scope[scopeSplit[scopeSplit.length - 1]](params);
	            }
	        };
	    };
	    this.get = function (name) {
	            var scope = this.registred;
	            var scopeSplit = name.split('.');
	            for (var i in scopeSplit) {
	                scope = scope[scopeSplit[i]];

	                if (scope == undefined) return null;
	            }
	            return scope;
	        },
	        this.set = function (name, value) {
	            var scope = this.registred;
	            var scopeSplit = name.split('.');
	            for (var i = 0; i < scopeSplit.length - 1; i++) {
	                scope = scope[scopeSplit[i]];

	                if (scope == undefined) throw 'Scope ' + name + ' has not found in registred controllers';
	            }
	            scope[scopeSplit[scopeSplit.length - 1]] = value;
	        };
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function ($, Ractive) {
	    var templatePath = '';
	    var templateFormat = '.html';
	    var partialsPath = '';
	    var partialsFormat = '.html';

	    var mainElement = 'body';

	    var templates = {};
	    var compileEvents = {};

	    var formatTemplateUrl = function (name) {
	        return templatePath + name + templateFormat;
	    };
	    var formatPartialUrl = function (name) {
	        return partialsPath + name + partialsFormat;
	    };
	    var callCompileEvents = function () {
	        for (var key in compileEvents) {
	            compileEvents[key]();
	        }
	    };

	    var pendents = 0;
	    var pendentsRequest = {};
	    var pendentCallback;

	    var resolvePendents = function () {
	        if (!--pendents) {
	            var requestLength = 0;
	            var lastRequestKey;
	            for (lastRequestKey in pendentsRequest) {
	                requestLength++;
	            }
	            if (requestLength == 1) {
	                pendentCallback(templates[pendentsRequest[lastRequestKey]]);
	            } else {
	                var temps = {};
	                for (var key in pendentsRequest) {
	                    temps[key] = templates[pendentsRequest[key]];
	                }
	                pendentCallback(temps);
	            }
	            pendentsRequest = {};
	        }
	    }

	    return {
	        registerCompileEvent: function (name, callback) {
	            compileEvents[name] = callback;
	        },
	        unregisterCompileEvent: function (name) {
	            delete compileEvents[name];
	        },
	        callCompileEvents: callCompileEvents,
	        loadSingle: function (name, optionalName) {
	            var alias = optionalName || name;

	            pendentsRequest[alias] = name;
	            if (typeof templates[name] === 'undefined') {
	                $.ajax({
	                    url: formatTemplateUrl(name),
	                    contentType: "text/html",
	                    dataType: "html",
	                    cache: true,
	                    success: function (template) {
	                        templates[name] = Ractive.extend({
	                            el: mainElement,
	                            template: template,
	                            oncomplete: function () {
	                                callCompileEvents();
	                            }
	                        });
	                    },
	                    error: function () {
	                        templates[name] = Ractive.extend({
	                            el: mainElement,
	                            template: 'Template não encontrado'
	                        });
	                    },
	                    complete: function () {
	                        resolvePendents();
	                    }
	                });
	            } else {
	                resolvePendents();
	            }
	        },
	        loadMultiple: function (map) {
	            for (var name in map) {
	                this.loadSingle(map[name], name);
	            }
	        },
	        load: function (map, callback) {
	            if (typeof callback === 'undefined') {
	                callback = function () {};
	            }
	            pendentCallback = callback;

	            if (typeof map === 'string') {
	                pendents++;
	                this.loadSingle(map);
	            } else {
	                for (var name in map) {
	                    pendents++;
	                }
	                this.loadMultiple(map);
	            }
	            return this;
	        },
	        compile: function (options) {
	            this.load(options.template, function (Component) {
	                delete options.template;
	                new Component(options);
	            });
	        },
	        registerPartial: function (name) {
	            $.get(formatPartialUrl(name), function (response) {
	                Ractive.partials[name] = response;
	            });
	        },
	        registerHelper: function (name, func) {
	            Ractive.defaults.data[name] = func;
	        },
	        getTemplatePath: function () {
	            return templatePath;
	        },
	        setTemplatePath: function (path) {
	            templatePath = path;
	        },
	        getTemplateFormat: function () {
	            return templateFormat;
	        },
	        setTemplateFormat: function (path) {
	            templateFormat = path;
	        },
	        getPartialsPath: function () {
	            return partialsPath;
	        },
	        setPartialsPath: function (path) {
	            partialsPath = path;
	        },
	        getPartialsFormat: function () {
	            return partialsFormat;
	        },
	        setPartialsFormat: function (path) {
	            partialsFormat = path;
	        },
	        getMainElement: function () {
	            return mainElement;
	        },
	        setMainElement: function (path) {
	            mainElement = path;
	        }
	    };
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function () {

	};

/***/ }
/******/ ]);