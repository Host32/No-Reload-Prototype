/*global module, require*/
(function () {
    'use strict';

    var helpers = require('../helpers'),
        isDefined = helpers.isDefined;

    function $StateProvider($injector, $templateProvider, $controllerProvider, $server, $urlResolver) {
        var instance,
            states = {},
            currentStateTree = [],
            lastUrl = '',
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

                if (subStates[i] !== currentStateTree[i] || diferentTree || i === (subStates.length - 1)) {
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
                lastUrl = url;
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

        function setCurrentStateTree(tree) {
            currentStateTree = tree;
        }

        instance = {
            register: register,
            go: go,
            reload: reload,
            isRegisteredState: isRegisteredState,
            isRegisteredUrl: isRegisteredUrl,
            goToUrl: goToUrl,
            clearCurrentStateTree: clearCurrentStateTree,
            setCurrentStateTree: setCurrentStateTree
        };

        return instance;
    }

    module.exports = $StateProvider;
}());
