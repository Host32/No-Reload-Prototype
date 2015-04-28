/*global module, require*/
(function ($) {
    'use strict';
    var helpers = require('./helpers'),
        router = require('./router'),
        template = require('./template'),

        Injector = require('./injector'),
        Ajax = require('../ajax');

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
                factory = injector.resolve(factory);
                injector.register(name, factory());
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

        function startup() {
            var i;
            for (i = 0; i < startupMethods.length; i += 1) {
                injector.resolve(startupMethods[i])();
            }
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
            template.extractParams(states).then(function (options) {
                myTemplate = new template.create(options);

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
                    resolveState(states[subStates[i]], params);
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
            go: goToState,
            goToUrl: goToUrl
        };

        return appInstance;
    }

    module.exports = {
        create: create
    };
}(window.jQuery));
