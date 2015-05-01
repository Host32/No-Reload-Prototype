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

	/*global window, require*/
	(function ($, Ractive) {
	    'use strict';

	    var NR = __webpack_require__(1),
	        Retro = __webpack_require__(2),
	        retro = new Retro($, Ractive);

	    window.NR = window.NoReload = NR.extend({}, NR, retro);
	}(window.jQuery, window.Ractive));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var appProvider = __webpack_require__(3),
	        helpers = __webpack_require__(4);

	    module.exports = helpers.extend({}, {
	        app: appProvider
	    }, helpers);
	}());


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var Ajax = __webpack_require__(5),
	        Routes = __webpack_require__(6),
	        Modules = __webpack_require__(7),
	        Templates = __webpack_require__(8),
	        WebSockets = __webpack_require__(9),
	        Events = __webpack_require__(10),
	        Forms = __webpack_require__(11),
	        Intervals = __webpack_require__(12),
	        Timeouts = __webpack_require__(13),
	        Prompt = __webpack_require__(14),

	        /**
	         * NoReload core class
	         * @param {object} $        jQuery
	         * @param {object} Ractive  Ractive
	         */
	        NoReload = function ($, Ractive) {
	            var NR = this,
	                serverAddress = '',
	                defaultRoute = '',
	                lastRoute = null,
	                route404 = null,
	                autoRenderTemplate = false,

	                isAjax = function (routeObj, params) {
	                    return routeObj.definition.type === 'ajax' && params === undefined;
	                },

	                getTemplateUrl = function (templateDef) {
	                    return (typeof templateDef === 'string') ? templateDef : templateDef.url;
	                },

	                isAutoRenderTemplate = function (templateDef) {
	                    return (templateDef.autoRender === undefined && autoRenderTemplate) || templateDef.autoRender;
	                },

	                formatTemplateOptions = function (templateDef, data) {
	                    if (typeof templateDef === 'string') {
	                        return {
	                            data: data
	                        };
	                    } else {
	                        if (isAutoRenderTemplate(templateDef)) {
	                            templateDef.data = data;
	                        }
	                        return templateDef;
	                    }
	                },

	                formatData = function (routeDef, data) {
	                    return routeDef.dataFilter ? routeDef.dataFilter(data) : data;
	                },

	                createControllerParams = function (route, data, template) {
	                    return {
	                        route: route,
	                        data: data,
	                        template: template
	                    };
	                },

	                /**
	                 * Takes appropriate action in accordance with the definition of the route
	                 * @param {Object} routeDef - The route definition
	                 * @param {Object} params
	                 */
	                processRouteParams = function (routeObj, params) {
	                    var routeDef = routeObj.definition;

	                    NR.events.trigger('beforeLoad', params);

	                    if (routeDef.template) {
	                        NR.templates.load(getTemplateUrl(routeDef.template)).then(function (Component) {
	                            var data, template, templateOpt;

	                            data = formatData(routeDef, params);
	                            templateOpt = formatTemplateOptions(routeDef.template, data);

	                            if (isAutoRenderTemplate(routeDef.template)) {
	                                template = new Component(templateOpt);
	                            } else {
	                                template = Component.extend(templateOpt);
	                            }

	                            if (routeDef.controller) {
	                                NR.call(routeDef.controller, createControllerParams(routeObj, data, template));
	                            } else {
	                                NR.modules.callInterceptors(createControllerParams(routeObj, data, template));
	                            }

	                            NR.events.trigger('afterLoad', params);

	                        });
	                    } else if (routeDef.controller) {
	                        NR.call(routeDef.controller, createControllerParams(routeObj, params));
	                        NR.events.trigger('afterLoad', params);
	                    } else {
	                        NR.modules.callInterceptors(createControllerParams(routeObj, params));
	                    }

	                },

	                /**
	                 * Routes the framework according to the type of the route
	                 * @param {Object}   routeObj - The route Object
	                 * @param {*} params
	                 */
	                doRoute = function (routeObj, params) {
	                    if (isAjax(routeObj, params)) {
	                        NR.ajax.run({
	                            url: routeObj.path,
	                            type: 'get',
	                            success: function (response) {
	                                processRouteParams(routeObj, response);
	                            }
	                        });
	                    } else {
	                        processRouteParams(routeObj, params);
	                    }
	                };

	            this.ajax = new Ajax(this, $);
	            this.events = new Events();
	            this.modules = new Modules();
	            this.routes = new Routes();
	            this.templates = new Templates(Ractive, $);
	            this.ws = new WebSockets();
	            this.prompt = new Prompt();
	            this.form = new Forms($, this, Ractive, this.prompt);
	            this.intervals = new Intervals();
	            this.timeouts = new Timeouts();


	            this.controllers = {};
	            this.states = {};
	            this.configs = [];
	            this.autoRun = [];

	            /**
	             * Perform an ajax call to start the system
	             * @param {Object} options - Ajax.run params
	             */
	            this.start = function (options) {
	                var opt = $.extend({
	                    url: options.url,
	                    success: function (response) {
	                        NR.call(options.controller, createControllerParams(options, response));
	                    }
	                }, options);

	                this.ajax.run(opt);
	            };

	            /**
	             * Changes the system state making call to a route
	             * @param {string} [route=defaultRoute] - The name of the route
	             * @param {*} params - Optional params for the route,
	             *                            if a param is passed the rout is called of static form
	             */
	            this.load = function (route, params) {
	                route = route || defaultRoute;

	                var routeObj = this.routes.find(route);
	                if (routeObj) {
	                    doRoute(routeObj, params);
	                } else if (route404) {
	                    routeObj = this.routes.find(route404);
	                    if (routeObj) {
	                        doRoute(routeObj, params);
	                    }
	                } else {
	                    throw "the route '" + route + "' has not yet been registered";
	                }
	                lastRoute = route;
	            };

	            this.reload = function (params) {
	                this.load(lastRoute, params);
	            };

	            this.call = function (controller, params) {
	                this.modules.call(controller, params);
	            };

	            this.startAnchorNavigation = function () {
	                /*global window*/
	                /*global location*/
	                $(window).on('hashchange', function () {
	                    var name = location.hash.replace(/^#/, '');
	                    NR.load(name);
	                });
	            };

	            this.registerBeforeLoadEvent = function (name, event) {
	                this.events.on('beforeLoad', name, event);
	            };
	            this.unregisterBeforeLoadEvent = function (name) {
	                this.events.off('beforeLoad', name);
	            };
	            this.registerAfterLoadEvent = function (name, event) {
	                this.events.on('afterLoad', name, event);
	            };
	            this.unregisterAfterLoadEvent = function (name) {
	                this.events.off('afterLoad', name);
	            };

	            this.getServerAddress = function () {
	                return serverAddress;
	            };
	            this.setServerAddress = function (address) {
	                serverAddress = address;
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
	            this.getRoute404 = function () {
	                return route404;
	            };
	            this.setRoute404 = function (routeName) {
	                route404 = routeName;
	            };
	            this.setAutoRenderTemplate = function (autoRender) {
	                autoRenderTemplate = autoRender;
	            };
	        };

	    module.exports = NoReload;
	}());


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';
	    var helpers = __webpack_require__(4),
	        moduleProvider = __webpack_require__(15);

	    module.exports = moduleProvider;
	}());


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	(function ($) {
	    'use strict';

	    function toInt(str) {
	        return parseInt(str, 10);
	    }

	    function isString(value) {
	        return typeof value === 'string';
	    }

	    function isNumber(value) {
	        return typeof value === 'number';
	    }

	    function isDefined(value) {
	        return typeof value !== 'undefined';
	    }

	    function isUndefined(value) {
	        return typeof value === 'undefined';
	    }

	    function isObject(value) {
	        return value !== null && typeof value === 'object';
	    }

	    function isWindow(obj) {
	        return obj && obj.window === obj;
	    }

	    function isNull(value) {
	        return value === null;
	    }

	    function isNonNull(value) {
	        return value !== null;
	    }

	    function isFunction(value) {
	        return typeof value === 'function';
	    }

	    function isBoolean(value) {
	        return typeof value === 'boolean';
	    }

	    function isArray(value) {
	        return Array.isArray(value);
	    }

	    function extend() {
	        return $.extend.apply($, arguments);
	    }

	    module.exports = {
	        toInt: toInt,
	        isString: isString,
	        isNumber: isNumber,
	        isDefined: isDefined,
	        isUndefined: isUndefined,
	        isObject: isObject,
	        isFunction: isFunction,
	        isBoolean: isBoolean,
	        isArray: isArray,
	        extend: extend
	    };

	}(window.jQuery));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Ajax
	 * @param {Object} NR - NoReload
	 * @param {Object} $ - jQuery
	 */
	var Ajax = function (NR, $) {
	    'use strict';
	    var ajax = this;

	    /**
	     * Default parameteres
	     *
	     * @returns {Object} default configuration.
	     */
	    this.getDefaultParams = function () {
	        return {
	            dataType: "json",
	            beforeSend: ajax.beforeSend,
	            complete: ajax.complete,
	            error: ajax.error,
	            cache: false
	        };
	    };

	    /**
	     * Function URL format
	     * @param   {string} location - Route URI
	     * @returns {string} Complete URL from server
	     */
	    this.prepareUrl = function (location) {
	        return NR.getServerAddress() + location;
	    };

	    this.error = function () {
	        throw "Ajax Error";
	    };
	    this.beforeSend = function () {};
	    this.complete = function () {};

	    /**
	     * Run a AJAX request
	     * @param {Object} params - jQuery AJAX params
	     */
	    this.run = function (params) {
	        var url = params.url || '';
	        params.url = this.prepareUrl(url);

	        params = $.extend(this.getDefaultParams(url), params);

	        $.ajax(params);
	    };
	};
	/*global module*/
	module.exports = Ajax;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

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
	            dataFilter: route.dataFilter,
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


	    this.escapeGroup = function (group) {
	        return group.replace(/([=!:$\/()])/g, '\\$1');
	    };

	    this.pathtoRegexp = function (path) {
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
	            capture = routes.escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

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

	/*global module*/
	module.exports = Routes;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Manage class
	 */
	var Modules = function () {
	    'use strict';
	    var modules = this,
	        registered = {},
	        interceptors = {};

	    /**
	     * Search by function among the registered modules
	     * @param   {String}   name - Path of the function
	     * @returns {function} - A function that can be call the searched function
	     */
	    this.getFunc = function (name) {
	        return function (params) {
	            var names = name.split(';'),
	                key,
	                scope,
	                scopeSplit,
	                i;

	            for (key in names) {
	                if (names.hasOwnProperty(key)) {
	                    scope = registered;
	                    scopeSplit = names[key].split('.');
	                    for (i = 0; i < scopeSplit.length - 1; i += 1) {
	                        scope = scope[scopeSplit[i]];

	                        if (scope === undefined) {
	                            break;
	                        }
	                    }
	                    if (scope !== undefined && scope[scopeSplit[scopeSplit.length - 1]] !== undefined) {
	                        return scope[scopeSplit[scopeSplit.length - 1]](params);
	                    }
	                }
	            }
	        };
	    };

	    this.register = function (name, Module) {
	        registered[name] = new Module();
	    };

	    this.callInterceptors = function (params) {
	        var name;
	        for (name in interceptors) {
	            if (interceptors.hasOwnProperty(name)) {
	                interceptors[name](params);
	            }
	        }
	    };
	    this.registerInterceptor = function (name, func) {
	        interceptors[name] = func;
	    };

	    /**
	     * Call for the function name
	     * @param {(string|function)} moduleFunc - The path of the function in the registered modules
	     * @param {*} params - The params that be passed for the function
	     */
	    this.call = function (moduleFunc, params) {
	        this.callInterceptors(params);

	        if (typeof moduleFunc === 'string') {
	            moduleFunc = this.getFunc(moduleFunc);
	        }

	        return moduleFunc(params);
	    };
	};

	/*global module*/
	module.exports = Modules;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Template manager
	 * @param   {Object} Ractive - Ractive
	 * @param   {Object} ajax - Ajax
	 */
	var Templates = function (Ractive, $) {
	    'use strict';
	    var templates = this,
	        templatePath = '',
	        templateFormat = '.ract',
	        partialsPath = '',
	        partialsFormat = '.ract',

	        ajaxCache = true,

	        mainElement = 'body',

	        cache = {},
	        deferreds = {},

	        /**
	         * Do the ajax call looking for template
	         * @param   {string} path - The URI of the template
	         * @returns {Object} - A deferreds with the ajax result
	         */
	        getTemplate = function (path) {
	            if (deferreds[path] === undefined) {
	                deferreds[path] = $.ajax({
	                    url: templates.formatTemplateUrl(path),
	                    dataType: "text",
	                    cache: ajaxCache,
	                    success: function (template) {
	                        cache[path] = templates.createRactive(template);
	                    },
	                    error: function () {
	                        cache[path] = templates.createRactive('Template não encontrado');
	                    }
	                });
	            }
	            return deferreds[path];
	        },
	        /**
	         * Return a promisse with a Ractive with the template file contents
	         * @param   {string} path - The URI of the template
	         * @returns {Object}
	         */
	        loadOne = function (path) {
	            return new Ractive.Promise(function (resolve, reject) {
	                getTemplate(path).done(function () {
	                    resolve(cache[path]);
	                });
	            });
	        },
	        /**
	         * Load multiple template files
	         * @param   {Object} map - A list of templates
	         * @returns {Object} - A promise with a Ractive with the template files contents
	         */
	        loadMultiple = function (map) {
	            return new Ractive.Promise(function (resolve, reject) {
	                var pendents = 0,
	                    results = {},
	                    name,

	                    load = function (path) {
	                        getTemplate(map[path]).done(function () {
	                            results[path] = cache[map[path]];
	                            pendents -= 1;
	                            if (!pendents) {
	                                resolve(results);
	                            }
	                        });
	                    };

	                for (name in map) {
	                    if (map.hasOwnProperty(name)) {
	                        pendents += 1;
	                        load(name);
	                    }
	                }
	            });
	        };

	    /**
	     * A load interface that can receive a string or a Object
	     * and wrapp the request for a loadSingle or a loadMultiple template
	     * @param   {(Object|string)} map - The template URI
	     * @param   {function} [callback] - Optiona, can be used in 'then' callback of the promisse
	     * @returns {Object} - Promise with the template
	     */
	    this.load = function (map, callback) {
	        var promise;
	        if (typeof map === 'string') {
	            promise = loadOne(map);
	        } else {
	            promise = loadMultiple(map);
	        }
	        if (typeof callback === 'undefined') {
	            return promise;
	        } else {
	            promise.then(callback);
	        }
	    };

	    /**
	     * Wrapper load that already makes the new object
	     * @param {Object}   options  - New instance options
	     * @param {function} [callback] - callback tha will be receiver the compiled object
	     */
	    this.compile = function (options, callback) {
	        this.load(options.url).then(function (Component) {
	            var component = new Component(options);

	            if (typeof callback === 'function') {
	                callback(component);
	            }
	        });
	    };

	    /**
	     * Create a default Ractive object using the main element and the template
	     * @param   {string} template
	     * @returns {Object}
	     */
	    this.createRactive = function (template) {
	        return Ractive.extend({
	            el: mainElement,
	            template: template
	        });
	    };

	    this.registerPartial = function (path) {
	        $.ajax({
	            url: templates.formatPartialUrl(path),
	            dataType: "text",
	            cache: ajaxCache,
	            success: function (response) {
	                Ractive.partials[path] = response;
	            }
	        });
	    };
	    this.registerHelper = function (name, func) {
	        Ractive.defaults.data[name] = func;
	    };

	    this.formatTemplateUrl = function (name) {
	        return templatePath + name + templateFormat;
	    };
	    this.formatPartialUrl = function (name) {
	        return partialsPath + name + partialsFormat;
	    };

	    // Main element *etters
	    this.getMainElement = function () {
	        return mainElement;
	    };
	    this.setMainElement = function (path) {
	        mainElement = path;
	    };

	    // Template *etters
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

	    // Partial *etters
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
	};

	/*global module*/
	module.exports = Templates;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	module.exports = function () {
	    'use strict';
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Events class
	 */
	var Events = function () {
	    'use strict';
	    var events = this,
	        registered = {
	            beforeLoad: {},
	            afterLoad: {}
	        };

	    /**
	     * Trigger an event
	     * @param {string} eventName - Name of event
	     * @param {*}  event - Params for event Handles
	     */
	    this.trigger = function (eventName, event) {
	        var key;
	        for (key in registered[eventName]) {
	            if (registered[eventName].hasOwnProperty(key)) {
	                registered[eventName][key](event);
	            }
	        }
	    };

	    /**
	     * Event handle
	     * @callback eventCallback
	     * @param {*} event - Params
	     */

	    /**
	     * Register an event handle
	     * @param {string} eventName
	     * @param {string} handleName
	     * @param {eventCallback} handle
	     */
	    this.on = function (eventName, handleName, handle) {
	        if (!registered[eventName]) {
	            registered[eventName] = {};
	        }
	        if (typeof handle !== 'function') {
	            throw 'invalid event handle';
	        }
	        registered[eventName][handleName] = handle;
	    };


	    /**
	     * Unregister an event handle
	     * @param {string} eventName
	     * @param {string} handleName
	     */
	    this.off = function (eventName, handleName) {
	        if (!registered[eventName]) {
	            return;
	        }
	        delete registered[eventName][handleName];
	    };
	};

	/*global module*/
	module.exports = Events;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*global require*/
	var Validate = __webpack_require__(16);
	var Mask = __webpack_require__(17);
	var Forms = function ($, NR, Ractive, prompt) {
	    'use strict';
	    var forms = this,

	        formWidget = Ractive.extend({
	            template: '<form id="{{this["nr-form-id"]}}" class="nr-form {{class}}" action="{{action}}" method="{{method || "get"}}" on-submit="envia">{{>content}}</form>',
	            onrender: function () {
	                forms.mask.form(forms.getCompForm(this));

	                this.on('envia', function (event) {
	                    this.set('formNode', event.node);
	                    if (this.get('nr-validate')) {
	                        if (forms.validate.form(forms.getCompForm(this), this.get('nr-show-error-popup'))) {
	                            forms.submit(this);
	                        }
	                    } else {
	                        forms.submit(this);
	                    }
	                });
	            }
	        }),
	        getBooleanOption = function (text, dft) {
	            return text === undefined ? dft : (text === 'false' ? false : (text === 'true' ? true : text));
	        };

	    Ractive.components['nr:form'] = formWidget;

	    this.validate = new Validate($, prompt);
	    this.mask = new Mask($);

	    this.submit = function (comp) {
	        var question = comp.get('nr-question');
	        if (question) {
	            prompt.question(question, function () {
	                forms.send(comp);
	            });
	        } else {
	            forms.send(comp);
	        }
	    };
	    this.getCompForm = function (comp) {
	        return $(comp.get('formNode'));
	    };
	    this.send = function (comp) {
	        var callback = comp.get('nr-callback') || false,
	            redirect = getBooleanOption(comp.get('nr-redirect'), false),
	            reload = getBooleanOption(comp.get('nr-reload'), false),
	            contentType = comp.get('nr-content-type') || 'application/x-www-form-urlencoded; charset=UTF-8',
	            data = contentType === 'application/json' ? JSON.stringify(comp.get("nr-data")) : this.getCompForm(comp).serialize();

	        NR.ajax.run({
	            url: comp.get('action'),
	            type: comp.get('method') || 'get',
	            contentType: contentType,
	            data: data,
	            success: function (response) {
	                if (callback) {
	                    NR.modules.call(callback, {
	                        data: response
	                    });
	                }
	                if (reload === true) {
	                    NR.reload(response);
	                } else if (reload) {
	                    NR.load(reload, response);
	                } else if (redirect === true) {
	                    NR.reload();
	                } else if (redirect) {
	                    NR.load(redirect);
	                }
	            }
	        });
	    };
	};

	/*global module*/
	module.exports = Forms;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var Intervals = function () {
	    'use strict';
	    var registered = {};

	    this.register = function (name, func, time, cleanable) {
	        if (cleanable === undefined) {
	            cleanable = true;
	        }

	        registered[name] = {
	            interval: setInterval(func, time),
	            cleanable: cleanable
	        };
	    };
	    this.clear = function (name) {
	        if (registered[name] !== undefined) {
	            clearInterval(registered[name].interval);
	        }
	    };
	    this.clearAll = function () {
	        var key;
	        for (key in registered) {
	            if (registered.hasOwnProperty(key) && registered[key].cleanable) {
	                clearInterval(registered[key].interval);
	            }
	        }
	    };
	};

	/*global module*/
	module.exports = Intervals;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Timeouts = function () {
	    'use strict';
	    var registered = {};

	    this.register = function (name, func, time, cleanable) {
	        if (cleanable === undefined) {
	            cleanable = true;
	        }

	        registered[name] = {
	            timeout: setTimeout(func, time),
	            cleanable: cleanable
	        };
	    };
	    this.clear = function (name) {
	        if (registered[name] !== undefined) {
	            clearTimeout(registered[name].timeout);
	        }
	    };
	    this.clearAll = function () {
	        var key;
	        for (key in registered) {
	            if (registered.hasOwnProperty(key) && registered[key].cleanable) {
	                clearTimeout(registered[key].timeout);
	            }
	        }
	    };
	};

	/*global module*/
	module.exports = Timeouts;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Prompt = function () {
	    'use strict';

	    this.question = function (message, callback) {
	        /*global confirm*/
	        var confirmacao = confirm(message);
	        if (confirmacao) {
	            callback();
	        }
	    };
	    this.show = function (message) {
	        /*global alert*/
	        alert(message);
	    };
	    this.error = function (message) {
	        /*global alert*/
	        alert(message);
	    };
	};

	/*global module*/
	module.exports = Prompt;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';
	    var moduleFactory = __webpack_require__(18),

	        modules = {},

	        moduleProvider = function (name, deps) {
	            if (!modules[name]) {
	                modules[name] = moduleFactory(deps);
	            }
	            return modules[name];
	        };

	    module.exports = moduleProvider;
	}());


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var Validate = function ($, prompt) {
	    'use strict';
	    var validate = this,
	        defaultLanguage = 'en',

	        ALPHA_EXP = /^[a-z]+$/i,
	        NATURAL_EXP = /^[0-9]+$/i,
	        NUMBER_EXP = /^([\-]?[0-9]*[\.]?[0-9]*)$/i,
	        ALPHA_NUMERIC_EXP = /^[a-z0-9]+$/i,
	        ALPHA_DASH_EXP = /^[a-z0-9_\-]+$/i,
	        EMAIL_EXP = /^([\w\-]+(?:\.[\w\-]+)*)@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
	        EMAILS_EXP = /^((^([\w\-]+(?:\.[\w\-]+)*)@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?))([,]?))+$/,
	        IP_EXP = /^[\d]{1,3}(\.([\d]{1,3})){3}$/,

	        RULE_PARAM_EXP = /\[([\w]*)\]/,

	        validations = {
	            required: function (value) {
	                if (typeof value === 'string') {
	                    return value.trim().length > 0;
	                }

	                return typeof value !== 'undefined' && value !== null;
	            },
	            matches: function (value, seletor) {
	                /*jslint eqeq:true*/
	                return value == $(seletor).val();
	            },
	            min_length: function (value, length) {
	                return value.length >= length;
	            },
	            max_length: function (value, length) {
	                return value.length <= length;
	            },
	            exact_length: function (value, length) {
	                /*jslint eqeq:true*/
	                return value.length == length;
	            },
	            greater_than: function (value, number) {
	                return NUMBER_EXP.test(value) && parseInt(value, 10) >= number;
	            },
	            less_than: function (value, number) {
	                return NUMBER_EXP.test(value) && parseInt(value, 10) <= number;
	            },
	            alpha: function (value) {
	                return ALPHA_EXP.test(value);
	            },
	            alpha_numeric: function (value) {
	                return ALPHA_NUMERIC_EXP.test(value);
	            },
	            alpha_dash: function (value) {
	                return ALPHA_DASH_EXP.test(value);
	            },
	            numeric: function (value) {
	                return (value - parseFloat(value) + 1) >= 0;
	            },
	            is_natural: function (value) {
	                return NATURAL_EXP.test(value);
	            },
	            valid_email: function (value) {
	                return EMAIL_EXP.test(value);
	            },
	            valid_emails: function (value) {
	                return EMAILS_EXP.test(value);
	            },
	            valid_ip: function (value) {
	                return IP_EXP.test(value);
	            }
	        },
	        validationErrors = {
	            en: {
	                required: '',
	                matches: '',
	                min_length: '',
	                max_length: '',
	                exact_length: '',
	                greater_than: '',
	                less_than: '',
	                alpha: '',
	                alpha_numeric: '',
	                alpha_dash: '',
	                numeric: '',
	                is_natural: '',
	                valid_email: '',
	                valid_emails: '',
	                valid_ip: ''
	            },
	            ptbr: {
	                required: 'O campo $1 é obrigatório.',
	                matches: 'O campo valor no campo $1 não é idêntico ao valor de outro campo.',
	                min_length: 'O campo $1 precisa de no mínimo $2 characteres.',
	                max_length: 'O campo $1 pode ter no máximo $2 characteres.',
	                exact_length: 'O campo $1 precisa de exatamente $2 characteres.',
	                greater_than: 'O campo $1 deve conter um valor de no mínimo $2.',
	                less_than: 'O campo $1 deve conter um valor de no máximo $2.',
	                alpha: 'O campo $1 aceita somente letras.',
	                alpha_numeric: 'O campo $1 aceita somente letras e números',
	                alpha_dash: 'O campo $1 aceita somente letras, números, underlines e traços.',
	                numeric: 'O campo $1 só aceita valores numéricos',
	                is_natural: 'O campo $1 só aceita numeros naturais.',
	                valid_email: 'O campo $1 precisa de um email válido.',
	                valid_emails: 'O campo $1 só aceita uma lista de emails válidos separados por vírgula.',
	                valid_ip: 'O campo $1 só aceita endereços de IP válidos.'
	            }
	        };

	    this.registerValidation = function (name, func, messages) {
	        validations[name] = func;

	        messages = messages || {};
	        var lang;
	        for (lang in messages) {
	            if (messages.hasOwnProperty(lang)) {
	                this.registerLang(lang);
	                validationErrors[lang][name] = messages[lang];
	            }
	        }
	    };
	    this.registerValidationMessage = function (name, lang, message) {
	        this.registerLang(lang);
	        validationErrors[lang][name] = message;
	    };
	    this.registerLang = function (lang) {
	        if (typeof validationErrors[lang] === 'undefined') {
	            validationErrors[lang] = {};
	        }
	    };
	    this.setLanguage = function (lang) {
	        defaultLanguage = lang;
	    };
	    this.validate = function (rule, value, param) {
	        return (typeof validations[rule] === 'function') ? validations[rule](value, param) : true;
	    };
	    this.showError = function (errorMessage, field) {
	        var errorDest = $(field).attr('nr-error-field') || false;
	        if (errorDest) {
	            $(errorDest).html(errorMessage);
	        }
	    };
	    this.errorMessage = '';
	    this.field = function (field) {
	        var $field = $(field),
	            rules = $field.data('validate') || '',
	            rule,
	            rulesSplit,
	            ruleKey,
	            params,
	            param,
	            value;

	        if (rules.length > 0) {
	            rulesSplit = rules.split('|');

	            for (ruleKey in rulesSplit) {
	                if (rulesSplit.hasOwnProperty(ruleKey)) {
	                    params = rulesSplit[ruleKey].match(RULE_PARAM_EXP);
	                    param = params !== null ? params[0].replace('[', '').replace(']', '') : null;
	                    rule = rulesSplit[ruleKey].replace(RULE_PARAM_EXP, '');

	                    value = $field.attr('type') === 'checkbox' ? $field.prop('checked') : $field.val();

	                    if (!this.validate(rule, value, param)) {
	                        this.errorMessage = validationErrors[defaultLanguage][rule]
	                            .replace('$1', $field.data('name') || $field.attr('name'))
	                            .replace('$2', param);

	                        this.showError(this.errorMessage, $field);

	                        return false;
	                    }
	                }
	            }
	        }
	        return true;
	    };
	    this.form = function (form, showPopup) {
	        var errorMessage = '',
	            foundError = false;
	        $(form).find(':input').each(function () {
	            if (!validate.field($(this))) {
	                foundError = true;
	                errorMessage += validate.errorMessage + '\n';
	            }
	        });

	        if (foundError && showPopup) {
	            prompt.error(errorMessage);
	        }

	        return !foundError;
	    };
	};

	/*global module*/
	module.exports = Validate;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Mask = function ($) {
	    'use strict';
	    var mask = this,
	        registered = {
	            uppercase: function (value) {
	                return typeof value === 'string' ? value.toUpperCase() : value;
	            },
	            lowercase: function (value) {
	                return typeof value === 'string' ? value.toLowerCase() : value;
	            }
	        };

	    this.format = function (rule, value) {
	        return typeof registered[rule] === 'function' ? registered[rule](value) : value;
	    };
	    this.register = function (name, func) {
	        registered[name] = func;
	    };

	    this.form = function (form) {
	        $(form).find(':input').each(function () {
	            mask.field(this);
	        });
	    };

	    this.field = function (field) {
	        $(field).on('keyup', function () {
	            var value = $(this).val(),
	                rules = $(this).data('mask'),
	                rulesSplit,
	                rulesSplitKey;

	            if (rules) {
	                rulesSplit = rules.split('|');

	                for (rulesSplitKey in rulesSplit) {
	                    if (rulesSplit.hasOwnProperty(rulesSplitKey)) {
	                        value = mask.format(rulesSplit[rulesSplitKey], value);
	                    }
	                }
	            }
	            $(this).val(value);
	        });

	    };
	};

	/*global module*/
	module.exports = Mask;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';
	    var $Injector = __webpack_require__(19),
	        $Ajax = __webpack_require__(20),
	        $Server = __webpack_require__(21),
	        $TemplateProvider = __webpack_require__(22),
	        $ControllerProvider = __webpack_require__(23),
	        $UrlResolver = __webpack_require__(24),
	        $StateProvider = __webpack_require__(25);

	    function Module(deps) {
	        var instance,
	            $injector = $Injector(),
	            configs = [],
	            runnables = [],

	            onUrlChange;

	        $injector("$injector", function () {
	            return $injector;
	        });

	        $injector("$ajax", $Ajax);
	        $injector("$server", $Server);
	        $injector("$controllerProvider", $ControllerProvider);
	        $injector("$templateProvider", $TemplateProvider);
	        $injector("$urlResolver", $UrlResolver);
	        $injector("$stateProvider", $StateProvider);

	        function factory(name, constructor) {
	            if (typeof name !== 'string') {
	                throw 'invalid service name';
	            }
	            if (typeof constructor !== 'function') {
	                throw 'invalid service constructor';
	            }

	            $injector(name, constructor);

	            return instance;
	        }

	        function controller(name, constructor) {
	            $injector(function ($controllerProvider) {
	                $controllerProvider.register(name, constructor);
	            });

	            return instance;
	        }

	        function state(name, definition) {
	            $injector(function ($stateProvider) {
	                $stateProvider.register(name, definition);
	            });

	            return instance;
	        }

	        function partial(name, definition) {
	            $injector(function ($templateProvider) {
	                $templateProvider.partial(name, definition);
	            });

	            return instance;
	        }

	        function component(name, definition) {
	            $injector(function ($templateProvider) {
	                $templateProvider.component(name, definition);
	            });

	            return instance;
	        }

	        function go(state, params) {
	            $injector(function ($stateProvider) {
	                $stateProvider.go(state, params);
	            });

	            return instance;
	        }

	        function goToUrl(url) {
	            $injector(function ($stateProvider) {
	                $stateProvider.goToUrl(url);
	            });

	            return instance;
	        }

	        function isRegisteredState(name) {
	            var $stateProvider = $injector.getDependency('$stateProvider');
	            return $stateProvider.isRegisteredState(name);
	        }

	        function isRegisteredUrl(url) {
	            var $stateProvider = $injector.getDependency('$stateProvider');
	            return $stateProvider.isRegisteredUrl(url);
	        }

	        function config(func) {
	            configs.push(func);
	            return instance;
	        }

	        function run(func) {
	            runnables.push(func);
	            return instance;
	        }

	        function configPhase() {
	            var i;
	            for (i = 0; i < configs.length; i += 1) {
	                $injector(configs[i]);
	            }
	        }

	        function runPhase() {
	            var i;
	            for (i = 0; i < runnables.length; i += 1) {
	                $injector(runnables[i]);
	            }
	        }

	        onUrlChange = function (url) {
	            goToUrl(url);
	        };

	        function start() {
	            configPhase();
	            runPhase();
	        }

	        instance = {
	            factory: factory,
	            controller: controller,
	            state: state,
	            component: component,
	            partial: partial,
	            go: go,
	            goToUrl: goToUrl,
	            config: config,
	            run: run,
	            isRegisteredState: isRegisteredState,
	            isRegisteredUrl: isRegisteredUrl,
	            onUrlChange: onUrlChange,
	            start: start
	        };

	        return instance;
	    }

	    module.exports = Module;
	}());


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Scope.js: https://github.com/alinz/scopejs
	 */
	/*global module*/
	/*jslint plusplus:true*/
	(function () {
	    'use strict';

	    function $Injector() {
	        var queues = {},
	            modules = {},

	            invoke;

	        function task(func) {
	            setTimeout(func, 0);
	        }

	        function forEach(arr, func) {
	            var length = arr ? arr.length : 0,
	                i;
	            for (i = 0; i < length; i++) {
	                func(arr[i], i);
	            }
	        }

	        function asyncMap(arr, func, done) {
	            var results = [],
	                length = arr.length,
	                i = 0;

	            if (!length) {
	                task(function () {
	                    done(results);
	                });
	            } else {
	                forEach(arr, function (item, index) {
	                    task(function () {
	                        func(item, function (result) {
	                            i++;
	                            results[index] = result;
	                            if (i === length) {
	                                done(results);
	                            }
	                        });
	                    });
	                });
	            }
	        }

	        /**
	         * Conditions:
	         * 1: Module has been registered but not loaded
	         * 2: Module has been registered and loaded
	         * 3: Module has not been registered
	         *
	         * @param name
	         * @param func
	         */

	        function queueOrGet(name, func) {
	            if (!modules[name]) {
	                if (!invoke.get) {
	                    throw "Injector.get has not defined";
	                }
	                modules[name] = {};
	                if (!queues[name]) {
	                    queues[name] = [];
	                }
	                queues[name].push(func);
	                invoke.get(name, function (o) {
	                    if (o) {
	                        modules[name] = {
	                            o: o
	                        };
	                    }
	                    func();
	                });
	            } else {
	                if (modules[name].o !== undefined) {
	                    func();
	                } else {
	                    if (!queues[name]) {
	                        queues[name] = [];
	                    }
	                    queues[name].push(func);
	                }
	            }
	        }

	        function runQueue(name) {
	            forEach(queues[name], function (func) {
	                func();
	            });
	            delete queues[name];
	        }

	        function getFuncArgs(func) {
	            var args = /^function\s*[\w\d$_]*\(([\w\d,_$\s]*)\)/.exec(func.toString())[1];
	            return args === '' ? [] : args.replace(/\s+/gm, '').split(",");
	        }

	        /**
	         * Conditions:
	         * 1: Anonimous function without invoke
	         * 2: Anonimous function with scope
	         * 3: Named module withoud scope
	         * 4: Named module with scope
	         */
	        invoke = function () {
	            var args = arguments,
	                info,
	                target,
	                obj = {};

	            if (typeof args[0] === 'string') {
	                obj.n = args[0];
	                info = args[1];
	                obj.s = args[2] || null;
	            } else {
	                info = args[0];
	                obj.s = args[1] || null;
	            }

	            if (typeof info === 'function') {
	                obj.d = getFuncArgs(info);
	                obj.c = info;
	            } else {
	                obj.c = info.pop();
	                obj.d = info;
	            }

	            if (obj.n) {
	                //We are checking whether module is requested or loaded.
	                //if target object is available + dependencies, it means that we have duplicates
	                //if we have only target but not dependencies, it means that module was requested by get call and module
	                //has been downloaded and now the real module is registering it self.
	                target = modules[obj.n];
	                if (target && target.d) {
	                    return;
	                }
	                modules[obj.n] = obj;
	            }

	            function dependencyResolver(dependency, callback) {
	                queueOrGet(dependency, function () {
	                    callback(modules[dependency].o);
	                });
	            }

	            function execute(loadedDependencies) {
	                obj.o = obj.c.apply(obj.s, loadedDependencies);
	                if (obj.n) {
	                    runQueue(obj.n);
	                }
	            }

	            asyncMap(obj.d, dependencyResolver, execute);
	        };

	        invoke.clear = function (name) {
	            if (queues[name]) {
	                return;
	            }

	            delete modules[name];
	        };

	        invoke.getDependency = function (name) {
	            if (modules[name]) {
	                return modules[name].o;
	            }
	            return null;
	        };

	        return invoke;
	    }

	    module.exports = $Injector;
	}());


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function ($) {
	    'use strict';

	    function $Ajax() {
	        return $.ajax;
	    }

	    module.exports = $Ajax;
	}(window.jQuery));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var helpers = __webpack_require__(4),
	        extend = helpers.extend;

	    function $Server($ajax) {
	        var instance,
	            serverAddress = '',
	            defaultParams,
	            interceptors = [],

	            prepareUrl = function (location) {
	                return serverAddress + location;
	            },

	            error = function () {
	                throw "Server Error";
	            },

	            beforeSend = function () {},

	            complete = function () {};

	        function setDefaultParams(params) {
	            defaultParams = params;
	        }

	        function getDefaultParams() {
	            return defaultParams;
	        }

	        function getServerAddress() {
	            return serverAddress;
	        }

	        function setServerAddress(address) {
	            serverAddress = address;
	        }

	        function registerInterceptor(interceptor) {
	            interceptors.push(interceptor);
	        }

	        function createSuccessFunc(userSuccessFunc) {
	            return function (response) {
	                var i;
	                for (i = 0; i < interceptors.length; i += 1) {
	                    interceptors[i](response);
	                }
	                if (userSuccessFunc) {
	                    userSuccessFunc(response);
	                }
	            };
	        }

	        function run(params) {
	            var url = params.url || '';
	            params.url = instance.prepareUrl(url);
	            params.success = createSuccessFunc(params.success);

	            params = extend({}, defaultParams, params);

	            return $ajax(params);
	        }

	        function get(url, callback) {
	            var params = extend({}, defaultParams, {
	                url: instance.prepareUrl(url),
	                type: 'get',
	                success: createSuccessFunc(callback)
	            });

	            return $ajax(params);
	        }

	        instance = {
	            getServerAddress: getServerAddress,
	            setServerAddress: setServerAddress,
	            getDefaultParams: getDefaultParams,
	            setDefaultParams: setDefaultParams,
	            prepareUrl: prepareUrl,
	            error: error,
	            beforeSend: beforeSend,
	            complete: complete,
	            request: run,
	            get: get,
	            registerInterceptor: registerInterceptor
	        };

	        defaultParams = {
	            dataType: "json",
	            beforeSend: instance.beforeSend,
	            complete: instance.complete,
	            error: instance.error,
	            cache: false
	        };

	        return instance;
	    }

	    module.exports = $Server;
	}());


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function (Ractive) {
	    'use strict';
	    var helpers = __webpack_require__(4),
	        extend = helpers.extend,
	        isString = helpers.isString,
	        loaderProvider = __webpack_require__(26),
	        partialProvider = __webpack_require__(27),
	        componentProvider = __webpack_require__(28);

	    function $TemplateProvider($ajax) {
	        var instance,
	            loader = loaderProvider($ajax),
	            partialManager = partialProvider(loader),
	            componentManager = componentProvider(),
	            components = {},
	            componentQueue = {};

	        function getTemplatePath() {
	            return loader.getTemplatePath();
	        }

	        function setTemplatePath(path) {
	            loader.setTemplatePath(path);
	        }

	        function getTemplateFormat() {
	            return loader.getTemplateFormat();
	        }

	        function setTemplateFormat(format) {
	            loader.setTemplateFormat(format);
	        }

	        function corrigeParams(state, template) {
	            return new Ractive.Promise(function (resolve, reject) {
	                var options = extend({}, state),
	                    doneWithPartials = true,
	                    doneWithComponents = true;

	                options.template = template;
	                delete options.el;
	                delete options.controller;
	                delete options.serverLink;
	                delete options.templateUrl;

	                if (options.partials) {
	                    doneWithPartials = false;
	                    partialManager.resolve(options.partials).then(function (partials) {
	                        doneWithPartials = true;
	                        options.partials = partials;

	                        if (doneWithComponents) {
	                            resolve(options);
	                        }
	                    });
	                }
	                if (options.components) {
	                    doneWithComponents = false;
	                    componentManager.resolve(options.components).then(function (components) {
	                        doneWithComponents = true;
	                        options.components = components;

	                        if (doneWithPartials) {
	                            resolve(options);
	                        }
	                    });
	                }

	                if (doneWithPartials && doneWithComponents) {
	                    resolve(options);
	                }
	            });
	        }

	        function extractTemplateParams(state) {
	            return new Ractive.Promise(function (resolve, reject) {
	                if (state.templateUrl) {
	                    loader.load(state.templateUrl).then(function (template) {
	                        corrigeParams(state, template).then(function (options) {
	                            resolve(options);
	                        });
	                    });
	                } else {
	                    corrigeParams(state, state.template).then(function (options) {
	                        resolve(options);
	                    });
	                }
	            });
	        }

	        function create(options) {
	            return new Ractive.Promise(function (resolve, reject) {
	                extractTemplateParams(options).then(function (options) {
	                    resolve(Ractive.extend(options));
	                });
	            });
	        }

	        function partial(name, def) {
	            partialManager.register(name, def);
	        }

	        function component(name, def) {
	            componentManager.register(create, name, def);
	        }

	        instance = {
	            create: create,
	            component: component,
	            partial: partial,
	            getTemplatePath: getTemplatePath,
	            getTemplateFormat: getTemplateFormat,
	            setTemplatePath: setTemplatePath,
	            setTemplateFormat: setTemplateFormat
	        };

	        return instance;
	    }

	    module.exports = $TemplateProvider;
	}(window.Ractive));


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';
	    var helpers = __webpack_require__(4),
	        isFunction = helpers.isFunction,
	        isArray = helpers.isArray;

	    function $ControllerProvider($injector) {
	        var instance,
	            controllers = {};

	        function register(name, constructor) {
	            controllers[name] = constructor;

	            return instance;
	        }

	        function resolve(controller, scope) {
	            if (isFunction(controller) || isArray(controller)) {
	                $injector(controller, scope);
	            } else if (controllers[controller]) {
	                $injector(controllers[controller], scope);
	            }
	        }

	        instance = {
	            register: register,
	            resolve: resolve
	        };

	        return instance;
	    }

	    module.exports = $ControllerProvider;
	}());


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

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
	                    ulr: replaceUrl(params, url),
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


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var helpers = __webpack_require__(4),
	        isDefined = helpers.isDefined;

	    function $StateProvider($injector, $templateProvider, $controllerProvider, $server, $urlResolver) {
	        var instance,
	            states = {},
	            currentStateTree = [],
	            loadingState = false,
	            stateQueue = [],

	            resolveState;

	        function register(name, def) {
	            if (def.url) {
	                def.urlObject = $urlResolver.createUrlObject(def.url);
	            }
	            if (def.dataUrl) {
	                def.dataUrlFormat = def.dataUrl;
	            }
	            states[name] = def;

	            return instance;
	        }

	        function updateDataUrl(name, params) {
	            if (states[name]) {
	                states[name].dataUrl = $urlResolver.replaceUrl(params, states[name].dataUrlFormat);
	            }
	        }

	        function resolveQueue() {
	            loadingState = false;
	            if (stateQueue.length) {
	                var state = stateQueue.shift();
	                resolveState(state.name, state.params);
	            }
	        }

	        function runState(state, params, myTemplate, data) {
	            $injector.clear('$data');
	            $injector.clear('$stateParams');

	            $injector('$data', function () {
	                return data;
	            });
	            $injector('$stateParams', function () {
	                return params;
	            });

	            $controllerProvider.resolve(state.controller, myTemplate);

	            myTemplate.render(state.el);
	            resolveQueue();
	        }

	        function putOnQueue(name, params) {
	            stateQueue.push({
	                name: name,
	                params: params
	            });
	        }

	        resolveState = function (name, params) {
	            if (!states[name]) {
	                return;
	            }

	            if (loadingState) {
	                putOnQueue(name, params);
	                return;
	            }

	            var state = states[name],
	                dataUrl = state.dataUrl,
	                data = state.data || {},
	                myTemplate,
	                completeRequest = false,
	                completeTemplate = false;

	            loadingState = true;
	            if (dataUrl) {
	                $server.get(dataUrl, function (response) {
	                    data = response;

	                    completeRequest = true;
	                    if (completeTemplate) {
	                        runState(state, params, myTemplate, data);
	                    }
	                });
	            } else {
	                completeRequest = true;
	            }
	            $templateProvider.create(state).then(function (Template) {
	                myTemplate = new Template();

	                completeTemplate = true;
	                if (completeRequest) {
	                    runState(state, params, myTemplate, data);
	                }
	            });
	        };

	        function reload(params) {
	            var i;
	            for (i = 0; i < currentStateTree.length; i += 1) {
	                resolveState(states[currentStateTree[i]], params);
	            }

	            return instance;
	        }

	        function go(name, params) {
	            if (!states[name]) {
	                return;
	            }

	            var subStates = name.split('.'),
	                diferentTree = false,
	                fullStateName = '',
	                i;

	            for (i = 0; i < subStates.length; i += 1) {
	                fullStateName += subStates[i];

	                if (subStates[i] !== currentStateTree[i] || diferentTree) {
	                    diferentTree = true;
	                    resolveState(fullStateName, params);
	                }

	                fullStateName += '.';
	            }
	            currentStateTree = subStates;

	            return instance;
	        }

	        function findByUrl(url) {
	            var key, state, urlMatch;

	            for (key in states) {
	                if (states.hasOwnProperty(key) && states[key].url) {
	                    urlMatch = $urlResolver.resolve(states[key].urlObject, url);
	                    if (urlMatch) {
	                        urlMatch.stateName = key;
	                        return urlMatch;
	                    }
	                }
	            }
	            return null;
	        }

	        function goToUrl(url) {
	            var found = findByUrl(url);

	            if (found) {
	                updateDataUrl(found.stateName, found.params);
	                go(found.stateName, found.params);
	            }
	        }

	        function isRegisteredState(name) {
	            return isDefined(states[name]);
	        }

	        function isRegisteredUrl(url) {
	            return findByUrl(url) !== null;
	        }

	        function clearCurrentStateTree() {
	            currentStateTree = [];
	        }

	        instance = {
	            register: register,
	            go: go,
	            reload: reload,
	            isRegisteredState: isRegisteredState,
	            isRegisteredUrl: isRegisteredUrl,
	            goToUrl: goToUrl,
	            clearCurrentStateTree: clearCurrentStateTree,
	            currentStateTree: currentStateTree
	        };

	        return instance;
	    }

	    module.exports = $StateProvider;
	}());

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function (Ractive) {
	    'use strict';

	    function LoaderProvider($ajax) {
	        var templatePath = '',
	            templateFormat = '',
	            cache = {},
	            deferreds = {},
	            ajaxCache = true;

	        function getTemplatePath() {
	            return templatePath;
	        }

	        function setTemplatePath(path) {
	            templatePath = path;
	        }

	        function getTemplateFormat() {
	            return templateFormat;
	        }

	        function setTemplateFormat(format) {
	            templateFormat = format;
	        }

	        function formatTemplateUrl(name) {
	            return templatePath + name + templateFormat;
	        }


	        /**
	         * Do the ajax call looking for template
	         * @param   {string} path - The URI of the template
	         * @returns {Object} - A deferreds with the ajax result
	         */
	        function getTemplate(path) {
	            if (deferreds[path] === undefined) {
	                deferreds[path] = $ajax({
	                    url: formatTemplateUrl(path),
	                    dataType: "text",
	                    cache: ajaxCache,
	                    success: function (template) {
	                        cache[path] = template;
	                    },
	                    error: function () {
	                        cache[path] = 'Template não encontrado';
	                    }
	                });
	            }
	            return deferreds[path];
	        }

	        /**
	         * Return a promise with a Ractive with the template file contents
	         * @param   {string} path - The URI of the template
	         * @returns {Object}
	         */
	        function loadOne(path) {
	            return new Ractive.Promise(function (resolve, reject) {
	                getTemplate(path).done(function () {
	                    resolve(cache[path]);
	                });
	            });
	        }

	        /**
	         * Load multiple template files
	         * @param   {Object} map - A list of templates
	         * @returns {Object} - A promise with a Ractive with the template files contents
	         */
	        function loadMultiple(map) {
	            return new Ractive.Promise(function (resolve, reject) {
	                var pendents = 0,
	                    results = {},
	                    name,

	                    load = function (path) {
	                        getTemplate(map[path]).done(function () {
	                            results[path] = cache[map[path]];
	                            pendents -= 1;
	                            if (!pendents) {
	                                resolve(results);
	                            }
	                        });
	                    };

	                for (name in map) {
	                    if (map.hasOwnProperty(name)) {
	                        pendents += 1;
	                        load(name);
	                    }
	                }
	            });
	        }

	        /**
	         * A load interface that can receive a string or a Object
	         * and wrapp the request for a loadSingle or a loadMultiple template
	         * @param   {(Object|string)} map - The template URI
	         * @param   {function} [callback] - Optiona, can be used in 'then' callback of the promise
	         * @returns {Object} - Promise with the template
	         */
	        function load(map, callback) {
	            var promise;
	            if (typeof map === 'string') {
	                promise = loadOne(map);
	            } else {
	                promise = loadMultiple(map);
	            }
	            if (typeof callback === 'undefined') {
	                return promise;
	            } else {
	                promise.then(callback);
	            }
	        }

	        return {
	            load: load,
	            getTemplatePath: getTemplatePath,
	            setTemplatePath: setTemplatePath,
	            getTemplateFormat: getTemplateFormat,
	            setTemplateFormat: setTemplateFormat,
	            formatTemplateUrl: formatTemplateUrl
	        };
	    }

	    module.exports = LoaderProvider;
	}(window.Ractive));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function (Ractive) {
	    'use strict';

	    function PartialProvider(loaderRef) {
	        var partials = {},
	            partialQueue = {},
	            loader = loaderRef;

	        function resolveQueue(name, partial) {
	            if (partialQueue[name]) {
	                var i;
	                for (i = 0; i < partialQueue[name].length; i += 1) {
	                    partialQueue[name][i](partial);
	                }
	                delete partialQueue[name];
	            }
	        }

	        function completeRegister(name, template, isGlobal) {
	            if (isGlobal) {
	                delete partials[name];
	                Ractive.partials[name] = template;
	            } else {
	                partials[name] = template;
	                resolveQueue(name, partials[name]);
	            }
	        }

	        function register(name, def) {
	            if (def.template) {
	                completeRegister(name, def.template, def.global);
	            } else if (def.templateUrl) {
	                partials[name] = 1;
	                loader.load(def.templateUrl).then(function (partial) {
	                    completeRegister(name, partial, def.global);
	                });
	            }
	        }

	        function putOnQueue(name, func) {
	            if (!partialQueue[name]) {
	                partialQueue[name] = [];
	            }

	            partialQueue[name].push(func);
	        }

	        function resolveOne(partial) {
	            return new Ractive.Promise(function (resolve, reject) {
	                if (partials[partial] === 1) {
	                    putOnQueue(partial, resolve);
	                } else if (partials[partial]) {
	                    resolve(partials[partial]);
	                } else {
	                    resolve(partial);
	                }
	            });
	        }

	        function resolve(partials) {
	            return new Ractive.Promise(function (resolve, reject) {
	                var nPartials = {},
	                    pendents = 0,
	                    key,

	                    load = function (key) {
	                        resolveOne(partials[key]).then(function (partial) {
	                            nPartials[key] = partial;
	                            pendents -= 1;
	                            if (!pendents) {
	                                resolve(nPartials);
	                            }
	                        });
	                    };

	                for (key in partials) {
	                    if (partials.hasOwnProperty(key)) {
	                        pendents += 1;
	                        load(key);
	                    }
	                }
	            });
	        }

	        return {
	            resolve: resolve,
	            resolveOne: resolveOne,
	            register: register
	        };
	    }

	    module.exports = PartialProvider;
	}(window.Ractive));


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function (Ractive) {
	    'use strict';

	    function ComponentProvider() {
	        var components = {},
	            componentQueue = {};

	        function resolveQueue(name, component) {
	            if (componentQueue[name]) {
	                var i;
	                for (i = 0; i < componentQueue[name].length; i += 1) {
	                    componentQueue[name][i](component);
	                }
	                delete componentQueue[name];
	            }
	        }

	        function register(templateCreator, name, def) {
	            components[name] = 1;
	            templateCreator(def).then(function (Template) {
	                if (def.global) {
	                    delete components[name];
	                    Ractive.components[name] = Template;
	                } else {
	                    components[name] = Template;
	                    resolveQueue(name, components[name]);
	                }
	            });
	        }

	        function putOnQueue(name, func) {
	            if (!componentQueue[name]) {
	                componentQueue[name] = [];
	            }

	            componentQueue[name].push(func);
	        }

	        function resolveOne(component) {
	            return new Ractive.Promise(function (resolve, reject) {
	                if (components[component] === 1) {
	                    putOnQueue(component, resolve);
	                } else if (components[component]) {
	                    resolve(components[component]);
	                } else {
	                    resolve(component);
	                }
	            });
	        }

	        function resolve(components) {
	            return new Ractive.Promise(function (resolve, reject) {
	                var nComponents = {},
	                    pendents = 0,
	                    key,

	                    load = function (key) {
	                        resolveOne(components[key]).then(function (component) {
	                            nComponents[key] = component;
	                            pendents -= 1;
	                            if (!pendents) {
	                                resolve(nComponents);
	                            }
	                        });
	                    };

	                for (key in components) {
	                    if (components.hasOwnProperty(key)) {
	                        pendents += 1;
	                        load(key);
	                    }
	                }
	            });
	        }

	        return {
	            resolve: resolve,
	            resolveOne: resolveOne,
	            register: register
	        };
	    }

	    module.exports = ComponentProvider;
	}(window.Ractive));


/***/ }
/******/ ]);
