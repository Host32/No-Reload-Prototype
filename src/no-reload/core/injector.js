/**
 * Scope.js: https://github.com/alinz/scopejs
 */
/*global module*/
/*jslint plusplus:true*/
(function (Ractive) {
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
                if (!invoke.hasOwnProperty('get')) {
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
                        func();
                    }
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
                obj = {},
                copy;

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
                copy = info.slice(0);
                obj.c = copy.pop();
                obj.d = copy;
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

            return new Ractive.Promise(function (resolve, reject) {
                var dependencyResolver = function (dependency, callback) {
                        queueOrGet(dependency, function () {
                            callback(modules[dependency].o);
                        });
                    },
                    execute = function (loadedDependencies) {
                        obj.o = obj.c.apply(obj.s, loadedDependencies);
                        resolve();
                        if (obj.n) {
                            runQueue(obj.n);
                        }
                    };

                asyncMap(obj.d, dependencyResolver, execute);
            });
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
}(window.Ractive));
