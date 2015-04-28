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
	(function () {
	    'use strict';

	    window.NR = window.NoReload = __webpack_require__(1);
	}());


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var appProvider = __webpack_require__(2),
	        helpers = __webpack_require__(3),

	        apps = {};


	    function app(name) {
	        if (!apps[name]) {
	            apps[name] = appProvider.create();
	        }
	        return apps[name];
	    }

	    module.exports = helpers.extend({
	        app: app
	    }, helpers);
	}());

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function ($) {
	    'use strict';
	    var helpers = __webpack_require__(3),
	        router = __webpack_require__(4),
	        template = __webpack_require__(5),

	        Injector = __webpack_require__(6),
	        Ajax = __webpack_require__(7);

	    function create() {
	        var injector = new Injector(),
	            ajax = new Ajax(),

	            currentStateTree = [],

	            states = {},
	            controllers = {},

	            startupMethods = [],

	            appInstance;

	        injector.register('$template', template);
	        injector.register('$ajax', ajax);

	        function registerService(name, factory) {
	            if (helpers.isFunction(factory) || helpers.isArray(factory)) {
	                injector.register(name, injector.resolve(factory));
	            } else {
	                injector.register(name, factory);
	            }

	            return appInstance;
	        }

	        function registerState(name, def) {
	            if (def.url) {
	                def.urlReg = router.pathtoRegexp(def.url);
	            }
	            states[name] = def;

	            return appInstance;
	        }

	        function registerController(name, construtor) {
	            controllers[name] = construtor;

	            return appInstance;
	        }

	        function resolveController(name, scope) {
	            if (helpers.isFunction(name)) {
	                return function () {
	                    name.apply(scope);
	                };
	            } else if (!controllers[name]) {
	                return function () {};
	            }
	            return injector.resolve(controllers[name], scope);
	        }


	        function registerStartup(method) {
	            startupMethods.push(method);

	            return appInstance;
	        }

	        function runState(state, myTemplate, serverResponse) {
	            injector.registerFlash('$serverResponse', serverResponse);

	            var controller = resolveController(state.controller, myTemplate);

	            controller();

	            myTemplate.render(state.el);

	            injector.clearFlash();
	        }

	        function resolveState(name, params) {
	            if (!states[name]) {
	                return;
	            }

	            var state = states[name],
	                serverLink = state.serverLink,
	                serverResponse,
	                myTemplate,
	                completeRequest = false,
	                completeTemplate = false;

	            if (serverLink) {
	                ajax.run({
	                    url: serverLink,
	                    type: 'get',
	                    success: function (response) {
	                        serverResponse = response;

	                        completeRequest = true;
	                        if (completeTemplate) {
	                            runState(state, myTemplate, serverResponse);
	                        }
	                    }
	                });
	            } else {
	                completeRequest = true;
	            }
	            template.extractParams(state).then(function (options) {
	                var Template = template.create(options);
	                myTemplate = new Template();

	                completeTemplate = true;
	                if (completeRequest) {
	                    runState(state, myTemplate, serverResponse);
	                }
	            });
	        }

	        function reload(params) {
	            var i;
	            for (i = 0; i < currentStateTree.length; i += 1) {
	                resolveState(states[currentStateTree[i]], params);
	            }
	        }

	        function goToState(name, params) {
	            if (!states[name]) {
	                return;
	            }

	            var subStates = name.split('.'),
	                i;

	            for (i = 0; i < subStates.length; i += 1) {
	                if (subStates[i] !== currentStateTree[i]) {
	                    resolveState(subStates[i], params);
	                }
	            }
	            currentStateTree = subStates;
	        }

	        function extractParams(state, url) {
	            var urlReg = state.urlReg,
	                matches = url.match(urlReg.regExp),
	                matchedObject = {},
	                matchedKey,
	                keyIndice,
	                key;

	            for (keyIndice in urlReg.keys) {
	                if (urlReg.keys.hasOwnProperty(keyIndice)) {
	                    key = urlReg.keys[keyIndice];
	                    matchedKey = parseInt(keyIndice, 10) + 1;
	                    matchedObject[key.name] = matches[matchedKey];
	                }
	            }

	            return matchedObject;
	        }

	        function resolveUrl(url) {
	            var key, state;

	            for (key in states) {
	                if (states.hasOwnProperty(key) && states[key].url) {
	                    state = states[key];
	                    if (state.urlReg.regExp.test(url)) {
	                        return {
	                            state: state,
	                            params: extractParams(state, url)
	                        };
	                    }
	                }
	            }
	            return null;
	        }

	        function goToUrl(url) {
	            var found = resolveUrl(url);
	            if (found) {
	                goToState(found.state, found.params);
	            }
	        }

	        function startup() {
	            var i;
	            for (i = 0; i < startupMethods.length; i += 1) {
	                injector.resolve(startupMethods[i])();
	            }
	        }

	        function startAnchorNavigation() {
	            startup();

	            /*global window*/
	            /*global location*/
	            $(window).on('hashchange', function () {
	                var name = location.hash.replace(/^#/, '');
	                goToUrl(name);
	            });

	            return appInstance;
	        }

	        function start() {
	            startup();

	            return appInstance;
	        }

	        appInstance = {
	            factory: registerService,
	            startup: registerStartup,
	            state: registerState,
	            controller: registerController,
	            getController: resolveController,
	            resolve: injector.resolve,
	            start: start,
	            startAnchorNavigation: startAnchorNavigation,
	            go: goToState,
	            goToUrl: goToUrl
	        };

	        return appInstance;
	    }

	    module.exports = {
	        create: create
	    };
	}(window.jQuery));

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function ($, Ractive) {
	    'use strict';
	    var helpers = __webpack_require__(3),

	        templatePath = '',
	        templateFormat = '',

	        ajaxCache = true,

	        cache = {},
	        deferreds = {};

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
	            deferreds[path] = $.ajax({
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
	     * Return a promisse with a Ractive with the template file contents
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
	     * @param   {function} [callback] - Optiona, can be used in 'then' callback of the promisse
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

	    function corrigeParams(state, template) {
	        var options = helpers.extend({}, state);

	        options.template = template;
	        delete options.el;
	        delete options.controller;
	        delete options.serverLink;
	        delete options.templateUrl;

	        return options;
	    }

	    function extractTemplateParams(state) {
	        if (state.templateUrl) {
	            return new Ractive.Promise(function (resolve, reject) {
	                load(state.templateUrl).then(function (template) {
	                    resolve(corrigeParams(state, template));
	                });
	            });
	        }
	        return new Ractive.Promise(function (resolve, reject) {
	            resolve(corrigeParams(state, state.template));
	        });
	    }

	    function create(options) {
	        return Ractive.extend(options);
	    }

	    module.exports = {
	        extractParams: extractTemplateParams,
	        create: create,
	        getTemplatePath: getTemplatePath,
	        getTemplateFormat: getTemplateFormat,
	        setTemplatePath: setTemplatePath,
	        setTemplateFormat: setTemplateFormat
	    };
	}(window.jQuery, window.Ractive));

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, require*/
	(function () {
	    'use strict';

	    var helpers = __webpack_require__(3);

	    function Injector() {
	        this.dependencies = {};
	        this.flashDependencies = {};
	    }

	    Injector.prototype.register = function (key, value) {
	        this.dependencies[key] = value;
	    };

	    Injector.prototype.registerFlash = function (key, value) {
	        this.flashDependencies[key] = value;
	    };

	    Injector.prototype.clearFlash = function () {
	        this.flashDependencies = {};
	    };

	    Injector.prototype.resolve = function (definition, scope) {
	        var func = function () {},
	            deps = [],
	            args = [],
	            self = this;

	        if (helpers.isFunction(definition)) {
	            func = definition;
	            deps = func.toString().match(/^[function\s]*[\(]*\(\s*([\w,$@\s]*)\)/m)[1].replace(/ /g, '').split(',');
	        } else if (helpers.isArray(definition)) {
	            func = definition[definition.length - 1];
	            deps = definition.splice(-1, 1);
	        }
	        return function () {
	            var i, d, value;
	            for (i = 0; i < deps.length; i += 1) {
	                d = deps[i];
	                if (self.dependencies[d] && d !== '') {
	                    value = self.dependencies[d];
	                    if (helpers.isFunction(value)) {
	                        value = value();
	                    }
	                    args.push(value);
	                }
	                if (self.flashDependencies[d] && d !== '') {
	                    args.push(self.flashDependencies[d]);
	                }
	            }
	            return func.apply(scope || {}, args);
	        };
	    };

	    module.exports = Injector;
	}());

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Ajax
	 */
	var $ = window.jQuery,
	    Ajax = function () {
	        'use strict';
	        var ajax = this,
	            serverAddress = '';

	        this.getServerAddress = function () {
	            return serverAddress;
	        };

	        this.setServerAddress = function (address) {
	            serverAddress = address;
	        };

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
	            return serverAddress + location;
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

/***/ }
/******/ ]);
