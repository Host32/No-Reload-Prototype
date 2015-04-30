/*global module, require*/
(function () {
    'use strict';

    var $UrlResolver = require('./url-resolver');

    function $StateProvider($injector, $templateProvider, $controllerProvider, $server) {
        var states = {},
            currentStateTree = [],

            instance;

        $injector("$urlResolver", $UrlResolver);

        function register(name, def) {
            $injector(function ($urlResolver) {
                if (def.url) {
                    def.urlReg = $urlResolver.pathtoRegexp(def.url);
                }
                states[name] = def;
            });

            return instance;
        }

        function runState(state, myTemplate, serverResponse) {
            $injector('$serverResponse', function () {
                return serverResponse;
            });

            $controllerProvider.resolve(state.controller, myTemplate);

            myTemplate.render(state.el);

            $injector.clear('$serverResponse');
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
                $server.get(serverLink, function (response) {
                    serverResponse = response;

                    completeRequest = true;
                    if (completeTemplate) {
                        runState(state, myTemplate, serverResponse);
                    }
                });
            } else {
                completeRequest = true;
            }
            $templateProvider.create(state).then(function (Template) {
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

            return instance;
        }

        function go(name, params) {
            if (!states[name]) {
                return;
            }

            var subStates = name.split('.'),
                diferentTree = false,
                i;

            for (i = 0; i < subStates.length; i += 1) {
                if (subStates[i] !== currentStateTree[i] || diferentTree) {
                    diferentTree = true;
                    resolveState(subStates[i], params);
                }
            }
            currentStateTree = subStates;

            return instance;
        }

        instance = {
            register: register,
            go: go,
            reload: reload
        };

        return instance;
    }

    module.exports = $StateProvider;
}());
