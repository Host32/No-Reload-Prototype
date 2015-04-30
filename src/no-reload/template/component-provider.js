/*global module, require*/
(function ($, Ractive) {
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
}(window.jQuery, window.Ractive));
