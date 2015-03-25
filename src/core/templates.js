module.exports = function ($, Ractive) {
    var templatePath = '';
    var templateFormat = '.html';
    var partialsPath = '';
    var partialsFormat = '.html';

    var mainElement = 'body';

    var templates = {};
    var compileEvents = {};

    var formatTemplateUrl = function (name) {
        return templatePath + name + templateFormat;
    };
    var formatPartialUrl = function (name) {
        return partialsPath + name + partialsFormat;
    };
    var callCompileEvents = function () {
        for (var key in compileEvents) {
            compileEvents[key]();
        }
    };

    var pendents = 0;
    var pendentsRequest = {};
    var pendentCallback;

    var resolvePendents = function () {
        if (!--pendents) {
            var requestLength = 0;
            var lastRequestKey;
            for (lastRequestKey in pendentsRequest) {
                requestLength++;
            }
            if (requestLength == 1) {
                pendentCallback(templates[pendentsRequest[lastRequestKey]]);
            } else {
                var temps = {};
                for (var key in pendentsRequest) {
                    temps[key] = templates[pendentsRequest[key]];
                }
                pendentCallback(temps);
            }
            pendentsRequest = {};
        }
    }

    return {
        registerCompileEvent: function (name, callback) {
            compileEvents[name] = callback;
        },
        unregisterCompileEvent: function (name) {
            delete compileEvents[name];
        },
        callCompileEvents: callCompileEvents,
        loadSingle: function (name, optionalName) {
            var alias = optionalName || name;

            pendentsRequest[alias] = name;
            if (typeof templates[name] === 'undefined') {
                $.ajax({
                    url: formatTemplateUrl(name),
                    contentType: "text/html",
                    dataType: "html",
                    cache: true,
                    success: function (template) {
                        templates[name] = Ractive.extend({
                            el: mainElement,
                            template: template,
                            oncomplete: function () {
                                callCompileEvents();
                            }
                        });
                    },
                    error: function () {
                        templates[name] = Ractive.extend({
                            el: mainElement,
                            template: 'Template não encontrado'
                        });
                    },
                    complete: function () {
                        resolvePendents();
                    }
                });
            } else {
                resolvePendents();
            }
        },
        loadMultiple: function (map) {
            for (var name in map) {
                this.loadSingle(map[name], name);
            }
        },
        load: function (map, callback) {
            if (typeof callback === 'undefined') {
                callback = function () {};
            }
            pendentCallback = callback;

            if (typeof map === 'string') {
                pendents++;
                this.loadSingle(map);
            } else {
                for (var name in map) {
                    pendents++;
                }
                this.loadMultiple(map);
            }
            return this;
        },
        compile: function (options) {
            this.load(options.template, function (Component) {
                delete options.template;
                new Component(options);
            });
        },
        registerPartial: function (name) {
            $.get(formatPartialUrl(name), function (response) {
                Ractive.partials[name] = response;
            });
        },
        registerHelper: function (name, func) {
            Ractive.defaults.data[name] = func;
        },
        getTemplatePath: function () {
            return templatePath;
        },
        setTemplatePath: function (path) {
            templatePath = path;
        },
        getTemplateFormat: function () {
            return templateFormat;
        },
        setTemplateFormat: function (path) {
            templateFormat = path;
        },
        getPartialsPath: function () {
            return partialsPath;
        },
        setPartialsPath: function (path) {
            partialsPath = path;
        },
        getPartialsFormat: function () {
            return partialsFormat;
        },
        setPartialsFormat: function (path) {
            partialsFormat = path;
        },
        getMainElement: function () {
            return mainElement;
        },
        setMainElement: function (path) {
            mainElement = path;
        }
    };
};