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
