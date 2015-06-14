/*global module, require*/
(function () {
    'use strict';

    var helpers = require('../helpers'),
        Promise = require('./promise'),
        isDefined = helpers.isDefined;

    function $StateProvider($injector, $templateProvider, $controllerProvider, $server, $scriptLoader, $routeResolver) {
        var instance,
            states = {},
            registerQueue = {},
            currentStateTree = [],
            lastUrl = '',
            stateQueue = [],
            stateRegisterQueue = [],
            statePaths = {},
            listeners = {
                beforeLoad: [],
                afterLoad: []
            },

            resolveState;

        function getState(name, statePath) {
            return new Promise(function (resolve, reject) {
                if (!states[name]) {
                    if (statePath) {
                        if (!registerQueue[name]) {
                            registerQueue[name] = [];
                        }
                        registerQueue[name].push(resolve);
                        $scriptLoader.load(statePath);
                    } else {
                        reject();
                    }
                } else {
                    resolve(states[name]);
                }
            });
        }

        function resolveRegisterQueue(name) {
            if (registerQueue[name]) {
                var key;
                for (key = 0; key < registerQueue[name].length; key += 1) {
                    registerQueue[name][key](states[name]);
                }
                delete registerQueue[name];
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

            resolveRegisterQueue(name);

            return instance;
        }

        function registerListener(phase, listener) {
            listeners[phase].push(listener);
        }

        function callListeners(phase) {
            var i;
            for (i = 0; i < listeners[phase].length; i += 1) {
                listeners[phase][i]();
            }
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
            if (stateQueue.length) {
                var state = stateQueue.shift();
                resolveState(state.name, state.params, state.path);
            } else {
                callListeners('afterLoad');
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

            if (state.controller) {
                $controllerProvider.resolve(state.controller, myTemplate, state.controllerPath).then(function () {
                    myTemplate.render(state.el);
                    resolveQueue();
                });
            } else {
                myTemplate.render(state.el);
                resolveQueue();
            }
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
            if (!statePath && statePaths[name]) {
                statePath = statePaths[name];
            }

            getState(name, statePath).then(function (state) {
                var dataUrl = formatDataUrl(state.dataUrl, params),
                    data = state.data || {},
                    myTemplate,
                    completeRequest = false,
                    completeTemplate = false;

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
            });
        };

        function reload(params) {
            var i;
            for (i = 0; i < currentStateTree.length; i += 1) {
                resolveState(states[currentStateTree[i]], params);
            }

            return instance;
        }

        function go(name, params, statePath) {
            var subStates = name.split('.'),
                diferentTree = false,
                fullStateName = '',
                path,
                i;

            callListeners('beforeLoad');
            for (i = 0; i < subStates.length; i += 1) {
                fullStateName += subStates[i];

                if (subStates[i] !== currentStateTree[i] || diferentTree || i === (subStates.length - 1)) {
                    diferentTree = true;
                    path = i === (subStates.length - 1) ? statePath : null;
                    putOnQueue(fullStateName, params, path);
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
            setCurrentStateTree: setCurrentStateTree,
            registerListener: registerListener
        };

        return instance;
    }

    module.exports = $StateProvider;
}());
