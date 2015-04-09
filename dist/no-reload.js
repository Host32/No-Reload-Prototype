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
	    var defaultRoute = '';

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

	    var ajax = new Ajax($);
	    var modules = new Modules();
	    var template = new Templates($, Ractive);
	    var routes = new Routes(template);
	    var ws = new WebSocket();

	    function isAjax(routeDef, params) {
	        return routeDef.definition.ajax && (selectedReloadPolicy === reloadPolicy.NEW_REQUEST || typeof params === 'undefined');
	    }

	    this.reloadPolicy = reloadPolicy;
	    this.beforeLoad = beforeLoad;
	    this.afterLoad = afterLoad;
	    this.utils = utils;
	    this.ajax = ajax;
	    this.modules = modules;
	    this.routes = routes;
	    this.template = template;
	    this.ws = ws;
	    this.startAnchorNavigation = function () {
	        var NR = this;
	        $(window).on('hashchange', function () {
	            var name = location.hash.replace(/^#/, '');
	            NR.load(name);
	        });
	    };
	    this.registerBeforeLoadEvent = function (name, event) {
	        beforeLoadEvents[name] = event;
	    };
	    this.unregisterBeforeLoadEvent = function (name) {
	        delete beforeLoadEvents[name];
	    };
	    this.registerAfterLoadEvent = function (name, event) {
	        afterLoadEvents[name] = event;
	    };
	    this.unregisterAfterLoadEvent = function (name) {
	        delete afterLoadEvents[name];
	    };
	    this.start = function (options) {
	        var opt = $.extend({}, {
	            url: options.url,
	            success: function (response) {
	                NR.call(options.controller, response)
	            }
	        }, options);

	        ajax.run(opt);
	    };
	    this.reload = function () {
	        this.load(lastRoute);
	    };
	    this.load = function (route, params) {
	        route = route || defaultRoute;
	        var routeDef = routes.find(route);
	        var NR = this;
	        if (routeDef) {
	            if (isAjax(routeDef, params)) {
	                ajax.run({
	                    url: routeDef.serverRoute,
	                    type: 'get',
	                    success: function (response) {
	                        response.route = routeDef;
	                        NR.call(routeDef.definition.controller, response);
	                    }
	                });
	            } else {
	                params = params || {};
	                params.route = routeDef;
	                NR.call(routeDef.definition.controller, params);
	            }
	            lastRoute = route;
	        } else {
	            throw "the route '" + route + "' has not yet been registered";
	        }
	    };
	    this.call = function (controller, params) {
	        this.beforeLoad();
	        modules.safeCall(controller, params);
	        this.afterLoad();
	    };
	    this.getCurrentRoute = function () {
	        return lastRoute;
	    };
	    this.getDefaultRoute = function () {
	        return defaultRoute;
	    };
	    this.setDefaultRoute = function (route) {
	        defaultRoute = route;
	    };
	    this.getServerAddress = function () {
	        return serverAddress;
	    };
	    this.setServerAddress = function (address) {
	        serverAddress = address;
	    };
	    this.setReloadPolicy = function (policy) {
	        selectedReloadPolicy = policy;
	    };
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function ($) {
	    this.getDefaultParams = function (url) {
	        var ajax = this;
	        return {
	            dataType: "json",
	            beforeSend: ajax.beforeSend,
	            complete: ajax.complete,
	            error: ajax.error,
	            cache: false
	        };
	    };
	    this.prepareUrl = function (location) {
	        return window.NoReload.getServerAddress() + location;
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

	module.exports = function (templateModule) {
	    'use strict';

	    // The main path matching regexp utility.
	    var PATH_REGEXP = new RegExp([
	        '(\\\\.)',
	        '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
	        '([.+*?=^!:${}()[\\]|\\/])'
	    ].join('|'), 'g');

	    var createDefaultTemplateController = function (template) {
	        return function (response) {
	            if (typeof template === 'string') {
	                templateModule.compile({
	                    template: template,
	                    data: response
	                });
	            } else {
	                template.data = response;
	                templateModule.compile(template);
	            }
	        };
	    };

	    this.registredRoutes = {};
	    this.register = function (params) {
	        if (params.route === undefined)
	            throw 'invalid route name';

	        if (params.template !== undefined) {
	            params.controller = createDefaultTemplateController(params.template);
	        } else if (params.controller === undefined) {
	            params.controller = function () {};
	        }

	        if (params.ajax === undefined)
	            params.ajax = true;

	        var alias = params.alias || params.route;

	        var routeReg = this.pathtoRegexp(alias);
	        this.registredRoutes[alias] = {
	            route: params.route,
	            regExp: routeReg.regExp,
	            keys: routeReg.keys,
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

	                var serverRoute = route.route;
	                for (var key2 in route.keys) {
	                    var matchesKey = parseInt(key2, 10) + 1;
	                    matches[route.keys[key2].name] = matches[matchesKey];
	                    var repl = matches[matchesKey] || '';
	                    serverRoute = serverRoute.replace(":" + route.keys[key2].name, repl);
	                }

	                return {
	                    definition: route,
	                    matches: matches,
	                    serverRoute: serverRoute
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
	                var scopeSplit = names[key].split('.');
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
	    var components = {};
	    var compiledComponents = {};

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

	    var deferreds = {};

	    var getTemplate = function (name, optionalName) {
	        var alias = optionalName || name;

	        if (typeof deferreds[name] === 'undefined') {
	            deferreds[name] = $.ajax({
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
	                        template: 'Template não encontrado',
	                        oncomplete: function () {
	                            callCompileEvents();
	                        }
	                    });
	                }
	            });
	        }
	        return deferreds[name];
	    };
	    var loadOne = function (name) {
	        return new Ractive.Promise(function (resolve, reject) {
	            getTemplate(name).done(function () {
	                resolve(templates[name]);
	            });
	        });
	    };
	    var loadMultiple = function (map) {
	        return new Ractive.Promise(function (resolve, reject) {
	            var pendents = 0;
	            var results = {};

	            var load = function (name) {
	                getTemplate(map[name], name).done(function () {
	                    results[name] = templates[map[name]];
	                    if (!--pendents) {
	                        resolve(results);
	                    }
	                });
	            };

	            for (var name in map) {
	                if (map.hasOwnProperty(name)) {
	                    pendents += 1;
	                    load(name);
	                }
	            }
	        });
	    };

	    this.callCompileEvents = callCompileEvents;
	    this.registerCompileEvent = function (name, callback) {
	        compileEvents[name] = callback;
	    };
	    this.unregisterCompileEvent = function (name) {
	        delete compileEvents[name];
	    };
	    this.registerComponent = function (name, options) {
	        components[name] = options;
	    };
	    this.loadComponent = function (name, callback) {
	        var self = this;
	        if (compiledComponents[name] === undefined) {
	            return new Ractive.Promise(function (resolve, reject) {
	                self.load(components[name].template).then(function (Component) {
	                    delete components[name].template;
	                    compiledComponents[name] = Component.extend(components[name]);

	                    resolve(compiledComponents[name]);
	                });
	            });
	        } else {
	            return new Ractive.Promise(function (resolve, reject) {
	                resolve(compiledComponents[name]);
	            });
	        }
	    };
	    this.load = function (map, callback) {
	        var promisse;
	        if (typeof map === 'string') {
	            promisse = loadOne(map);
	        } else {
	            promisse = loadMultiple(map);
	        }
	        if (typeof callback === 'undefined')
	            return promisse;
	        else {
	            promisse.then(callback);
	        }
	    };
	    this.compile = function (options, callback) {
	        this.load(options.template).then(function (Component) {
	            delete options.template;
	            var component = new Component(options);

	            if (typeof callback === 'function') {
	                callback(component);
	            }
	        });
	    };
	    this.registerPartial = function (name) {
	        $.get(formatPartialUrl(name), function (response) {
	            Ractive.partials[name] = response;
	        });
	    };
	    this.registerHelper = function (name, func) {
	        Ractive.defaults.data[name] = func;
	    };
	    this.getTemplatePath = function () {
	        return templatePath;
	    };
	    this.setTemplatePath = function (path) {
	        templatePath = path;
	    };
	    this.getTemplateFormat = function () {
	        return templateFormat;
	    };
	    this.setTemplateFormat = function (path) {
	        templateFormat = path;
	    };
	    this.getPartialsPath = function () {
	        return partialsPath;
	    };
	    this.setPartialsPath = function (path) {
	        partialsPath = path;
	    };
	    this.getPartialsFormat = function () {
	        return partialsFormat;
	    };
	    this.setPartialsFormat = function (path) {
	        partialsFormat = path;
	    };
	    this.getMainElement = function () {
	        return mainElement;
	    };
	    this.setMainElement = function (path) {
	        mainElement = path;
	    };
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function () {

	};

/***/ }
/******/ ]);
