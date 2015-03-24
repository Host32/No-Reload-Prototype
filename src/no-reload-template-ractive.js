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
                if (typeof pendentsRequest === 'string') {
                    pendentCallback(templates[pendentsRequest]);
                } else {
                    var temps = {};
                    for (var key in pendentsRequest) {
                        temps[key] = templates[pendentsRequest[key]];
                    }
                    pendentCallback(temps);
                }
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
                pendents++;
                if (typeof templates[name] === 'undefined') {
                    $.ajax({
                        url: formatTemplateUrl(name),
                        contentType: "text/html",
                        dataType: "html",
                        cache: true,
                        success: function (template) {
                            templates[alias] = template;
                        },
                        error: function () {
                            templates[alias] = 'Template não encontrado'
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
                if (typeof callback !== 'undefined') {
                    this.then(callback);
                }

                pendentsRequest = map;
                if (typeof map === 'string') {
                    this.loadSingle(map);
                } else {
                    this.loadMultiple(map);
                }
            },
            then: function (callback) {
                pendentCallback = callback;
            },
            compile: function (options, callback, data, onComplete) {
                if (typeof data !== 'undefined') {
                    this.oldCompile(options, callback, data, onComplete);
                    return;
                }

                var templates;
                if ($.isArray(options)) {
                    for (var key in options) {
                        templates[options[key].template] = options[key].template;
                    }
                } else {
                    templates[options.template] = options.template;
                }
                this.load(templates).then(function (templates) {
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
                    callback(ret);
                });
            },
            oldCompile: function (destino, templateName, data, onComplete) {
                if (typeof destino === 'object') {
                    return new Ractive(destino);
                }
                var t = this;
                this.load(templateName, function (template) {
                    var compiled = new Ractive({
                        el: destino,
                        template: template,
                        data: data,
                        onconstruct: function () {
                            t.callCompileEvents();
                            if (typeof onComplete === 'function') {
                                onComplete(compiled);
                            }
                        }
                    });
                });
            },
            compileInMain: function (templateName, data, onComplete) {
                if (typeof templateName === 'object') {
                    var params = $.extend({}, templateName, {
                        el: mainElement
                    });
                    return new Ractive(params);
                }
                this.oldCompile(mainElement, templateName, data, onComplete);
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