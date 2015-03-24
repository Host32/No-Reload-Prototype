(function (NR, $, Reactive) {
    'use strict';
    NR.template = (function () {
        var templatePath = '';
        var templateFormat = '.hbs';
        var partialsPath = '';
        var partialsFormat = '.hbs';

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
                            templates[name] = template;
                        },
                        error: function () {
                            templates[name] = 'Template não encontrado'
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
            manualCompile: function (options) {
                return new Ractive($.extend({}, {
                    el: mainElement
                }, options));
            },
            compile: function (options, callback) {
                var templates;
                if ($.isArray(options)) {
                    for (var key in options) {
                        templates[options[key].template] = options[key].template;
                    }
                } else if (typeof options === 'string') {
                    templates = options;
                } else {
                    templates = options.template;
                }
                this.load(templates, function (templates) {
                    var ret;
                    if ($.isArray(options)) {
                        for (var key in options) {
                            var opt = $.extend({
                                el: mainElement
                            }, options[key], {
                                template: templates[options[key].template]
                            });
                            ret[key] = new Ractive(opt);
                        }
                    } else {
                        ret = new Ractive($.extend({
                            el: mainElement
                        }, options, {
                            template: templates
                        }));
                    }
                    callCompileEvents();
                    if (typeof callback === 'function')
                        callback(ret);
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
    })();
})(NoReload, jQuery, Handlebars);