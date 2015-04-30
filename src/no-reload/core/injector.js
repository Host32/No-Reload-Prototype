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
                    throw "Err1";
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
            var args = /^function\s*[\w\d]*\(([\w\d,_$\s]*)\)/.exec(func.toString())[1];
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
                obj.s = args[2] || {};
            } else {
                info = args[0];
                obj.s = args[1] || {};
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
                    throw "Err2: " + obj.n;
                }
                modules[obj.n] = obj;
            }

            asyncMap(obj.d, function (dependency, func) {
                queueOrGet(dependency, function () {
                    func(modules[dependency].o);
                });
            }, function (loadedDependencies) {
                obj.o = obj.c.apply(obj.s, loadedDependencies);
                if (obj.n) {
                    runQueue(obj.n);
                }
            });
        };

        invoke.clear = function (name) {
            if (queues[name]) {
                throw "Err3: " + name;
            }

            delete modules[name];
        };

        return invoke;
    }

    module.exports = $Injector;
}());
