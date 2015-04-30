/*global module, require*/
(function ($, Ractive) {
    'use strict';
    var helpers = require('../helpers'),
        extend = helpers.extend,
        isString = helpers.isString;

    function $TemplateProvider() {
        var templatePath = '',
            templateFormat = '',

            ajaxCache = true,

            cache = {},
            deferreds = {},
            partials = {},
            partialQueue = {},
            components = {},
            componentQueue = {};

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
         * Return a promise with a Ractive with the template file contents
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
         * @param   {function} [callback] - Optiona, can be used in 'then' callback of the promise
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

        function resolvePartialQueue(name, partial) {
            if (partialQueue[name]) {
                var i;
                for (i = 0; i < partialQueue[name].length; i += 1) {
                    partialQueue[name][i](partial);
                }
                delete partialQueue[name];
            }
        }

        function registerPartial(name, template, isGlobal) {
            if (isGlobal) {
                delete partials[name];
                Ractive.partials[name] = template;
            } else {
                partials[name] = template;
                resolvePartialQueue(name, partials[name]);
            }
        }

        function partial(name, def) {
            if (def.template) {
                registerPartial(name, def.template, def.global);
            } else if (def.templateUrl) {
                partials[name] = 1;
                load(def.templateUrl).then(function (partial) {
                    registerPartial(name, partial, def.global);
                });
            }
        }

        function putOnPartialQueue(name, func) {
            if (!partialQueue[name]) {
                partialQueue[name] = [];
            }

            partialQueue[name].push(func);
        }

        function resolvePartial(partial) {
            return new Ractive.Promise(function (resolve, reject) {
                if (partials[partial] === 1) {
                    putOnPartialQueue(partial, resolve);
                } else if (partials[partial]) {
                    resolve(partials[partial]);
                } else {
                    resolve(partial);
                }
            });
        }

        function resolvePartials(partials) {
            return new Ractive.Promise(function (resolve, reject) {
                var nPartials = {},
                    pendents = 0,
                    key,

                    load = function (key) {
                        resolvePartial(partials[key]).then(function (partial) {
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

        function putOnComponentQueue(name, func) {
            if (!componentQueue[name]) {
                componentQueue[name] = [];
            }

            componentQueue[name].push(func);
        }

        function resolveComponent(component) {
            return new Ractive.Promise(function (resolve, reject) {
                if (components[component] === 1) {
                    putOnComponentQueue(component, resolve);
                } else if (components[component]) {
                    resolve(components[component]);
                } else {
                    resolve(component);
                }
            });
        }

        function resolveComponents(components) {
            return new Ractive.Promise(function (resolve, reject) {
                var nComponents = {},
                    pendents = 0,
                    key,

                    load = function (key) {
                        resolveComponent(components[key]).then(function (component) {
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

        function corrigeParams(state, template) {
            return new Ractive.Promise(function (resolve, reject) {
                var options = extend({}, state),
                    doneWithPartials = true,
                    doneWithComponents = true;

                options.template = template;
                delete options.el;
                delete options.controller;
                delete options.serverLink;
                delete options.templateUrl;

                if (options.partials) {
                    doneWithPartials = false;
                    resolvePartials(options.partials).then(function (partials) {
                        doneWithPartials = true;
                        options.partials = partials;

                        if (doneWithComponents) {
                            resolve(options);
                        }
                    });
                }
                if (options.components) {
                    doneWithComponents = false;
                    resolveComponents(options.components).then(function (components) {
                        doneWithComponents = true;
                        options.components = components;

                        if (doneWithPartials) {
                            resolve(options);
                        }
                    });
                }

                if (doneWithPartials && doneWithComponents) {
                    resolve(options);
                }
            });
        }

        function extractTemplateParams(state) {
            return new Ractive.Promise(function (resolve, reject) {
                if (state.templateUrl) {
                    load(state.templateUrl).then(function (template) {
                        corrigeParams(state, template).then(function (options) {
                            resolve(options);
                        });
                    });
                } else {
                    corrigeParams(state, state.template).then(function (options) {
                        resolve(options);
                    });
                }
            });
        }

        function create(options) {
            return new Ractive.Promise(function (resolve, reject) {
                extractTemplateParams(options).then(function (options) {
                    resolve(Ractive.extend(options));
                });
            });
        }

        function resolveComponentQueue(name, component) {
            if (componentQueue[name]) {
                var i;
                for (i = 0; i < componentQueue[name].length; i += 1) {
                    componentQueue[name][i](component);
                }
                delete componentQueue[name];
            }
        }

        function component(name, def) {
            components[name] = 1;
            create(def).then(function (Template) {
                if (def.global) {
                    delete components[name];
                    Ractive.components[name] = Template;
                } else {
                    components[name] = Template;
                    resolveComponentQueue(name, components[name]);
                }
            });
        }

        return {
            create: create,
            component: component,
            partial: partial,
            getTemplatePath: getTemplatePath,
            getTemplateFormat: getTemplateFormat,
            setTemplatePath: setTemplatePath,
            setTemplateFormat: setTemplateFormat
        };
    }

    module.exports = $TemplateProvider;
}(window.jQuery, window.Ractive));
