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

        return {
            registerCompileEvent: function (name, callback) {
                compileEvents[name] = callback;
            },
            unregisterCompileEvent: function (name) {
                delete compileEvents[name];
            },
            callCompileEvents: function () {
                for (var key in compileEvents) {
                    compileEvents[key]();
                }
            },
            load: function (name, callback) {
                if (typeof templates[name] === 'undefined') {
                    $.ajax({
                        url: formatTemplateUrl(name),
                        contentType: "text/html",
                        dataType: "html",
                        cache: true,
                        success: function (template) {
                            templates[name] = template;
                            callback(templates[name]);
                        },
                        error: function () {
                            templates[name] = 'Template não encontrado'
                            callback(templates[name]);
                        }
                    });
                } else {
                    callback(templates[name]);
                }
            },
            compile: function (destino, templateName, data, onComplete) {
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
                this.compile(mainElement, templateName, data, onComplete);
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