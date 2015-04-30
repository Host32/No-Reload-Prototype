/*global module, require*/
(function ($, Ractive) {
    'use strict';
    var helpers = require('../helpers'),
        extend = helpers.extend,
        isString = helpers.isString,
        loaderProvider = require('./loader-provider'),
        partialProvider = require('./partial-provider'),
        componentProvider = require('./component-provider');

    function $TemplateProvider() {
        var instance,
            loader = loaderProvider(),
            partialManager = partialProvider(loader),
            componentManager = componentProvider(),
            components = {},
            componentQueue = {};

        function getTemplatePath() {
            return loader.getTemplatePath();
        }

        function setTemplatePath(path) {
            loader.setTemplatePath(path);
        }

        function getTemplateFormat() {
            return loader.getTemplateFormat();
        }

        function setTemplateFormat(format) {
            loader.setTemplateFormat(format);
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
                    partialManager.resolve(options.partials).then(function (partials) {
                        doneWithPartials = true;
                        options.partials = partials;

                        if (doneWithComponents) {
                            resolve(options);
                        }
                    });
                }
                if (options.components) {
                    doneWithComponents = false;
                    componentManager.resolve(options.components).then(function (components) {
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
                    loader.load(state.templateUrl).then(function (template) {
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

        function partial(name, def) {
            partialManager.register(name, def);
        }

        function component(name, def) {
            componentManager.register(create, name, def);
        }

        instance = {
            create: create,
            component: component,
            partial: partial,
            getTemplatePath: getTemplatePath,
            getTemplateFormat: getTemplateFormat,
            setTemplatePath: setTemplatePath,
            setTemplateFormat: setTemplateFormat
        };

        return instance;
    }

    module.exports = $TemplateProvider;
}(window.jQuery, window.Ractive));
