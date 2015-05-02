/*global module, require*/
(function () {
    'use strict';

    var helpers = require('../helpers'),
        isDefined = helpers.isDefined;

    function $StateProvider($injector, $templateProvider, $controllerProvider, $server, $scriptLoader) {
        var instance,
            states = {},
            currentStateTree = [],
            lastUrl = '',
            loadingState = false,
            stateQueue = [],
            stateRegisterQueue = [],
            statePaths = {},

            resolveState;

        function resolveRegisterQueue() {
            loadingState = false;
            if (stateRegisterQueue.length) {
                var state = stateRegisterQueue.shift();
                resolveState(state.name, state.params);
            }
        }

        function registerPath(name, path) {
            statePaths[name] = path;
        }

        function register(name, def) {
            if (def.dataUrl) {
                def.dataUrlFormat = def.dataUrl;
            }
            states[name] = def;

            resolveRegisterQueue();

            return instance;
        }

        function formatDataUrl(stateDataUrl, params) {
            var key, dataUrl = stateDataUrl;
            if (dataUrl && params) {
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        dataUrl = dataUrl.replace(':' + key, params[key]);
                    }
                }
            }
            return dataUrl;
        }

        function resolveQueue() {
            loadingState = false;
            if (stateQueue.length) {
                var state = stateQueue.shift();
                resolveState(state.name, state.params, state.path);
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

            $controllerProvider.resolve(state.controller, myTemplate, state.controllerPath);

            myTemplate.render(state.el);
            resolveQueue();
        }

        function putOnQueue(name, params, path) {
            stateQueue.push({
                name: name,
                params: params,
                path: path
            });
        }

        function putOnRegisterQueue(name, params) {
            stateRegisterQueue.push({
                name: name,
                params: params
            });
        }

        resolveState = function (name, params, statePath) {
            if (!states[name]) {
                if (statePath) {
                    loadingState = true;
                    $scriptLoader.load(statePath);
                    putOnRegisterQueue(name, params);
                } else if (statePaths[name]) {
                    loadingState = true;
                    $scriptLoader.load(statePaths[name]);
                    putOnRegisterQueue(name, params);
                }
                return;
            }

            if (loadingState) {
                putOnQueue(name, params, statePath);
                return;
            }

            var state = states[name],
                dataUrl = formatDataUrl(state.dataUrl, params),
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

        function go(name, params, stateDepsPaths) {
            var subStates = name.split('.'),
                diferentTree = false,
                fullStateName = '',
                statePath,
                i;

            for (i = 0; i < subStates.length; i += 1) {
                fullStateName += subStates[i];

                if (subStates[i] !== currentStateTree[i] || diferentTree || i === (subStates.length - 1)) {
                    diferentTree = true;
                    statePath = stateDepsPaths ? stateDepsPaths[i] : null;
                    putOnQueue(fullStateName, params, statePath);
                }

                fullStateName += '.';
            }
            currentStateTree = subStates;
            resolveQueue();

            return instance;
        }


        function isRegisteredState(name) {
            return isDefined(states[name]);
        }

        function clearCurrentStateTree() {
            currentStateTree = [];
        }

        function setCurrentStateTree(tree) {
            currentStateTree = tree;
        }

        instance = {
            register: register,
            registerPath: registerPath,
            go: go,
            reload: reload,
            isRegisteredState: isRegisteredState,
            clearCurrentStateTree: clearCurrentStateTree,
            setCurrentStateTree: setCurrentStateTree
        };

        return instance;
    }

    module.exports = $StateProvider;
}());
