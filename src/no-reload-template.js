(function (NR, $, Handlebars) {
    NR.template = (function () {
        var templatePath = '';
        var templateFormat = '.hbs';
        var partialsPath = '';
        var partialsFormat = '.hbs';

        var mainElement = 'body';

        var templates = {};
        var preCompileEvents = {};
        var posCompileEvents = {};

        var formatTemplateUrl = function (name) {
            return templatePath + name + templateFormat;
        };
        var formatPartialUrl = function (name) {
            return partialsPath + name + partialsFormat;
        };

        return {
            registerPreCompileEvent: function (name, callback) {
                preCompileEvents[name] = callback;
            },
            unregisterPreCompileEvent: function (name) {
                delete preCompileEvents[name];
            },
            preCompile: function () {
                for (var key in preCompileEvents) {
                    preCompileEvents[key]();
                }
            },
            registerPosCompileEvent: function (name, callback) {
                posCompileEvents[name] = callback;
            },
            unregisterPosCompileEvent: function (name) {
                delete posCompileEvents[name];
            },
            posCompile: function () {
                for (var key in posCompileEvents) {
                    posCompileEvents[key]();
                }
            },
            loadTemplate: function (name, callback) {
                if (typeof templates[name] === 'undefined') {
                    $.ajax({
                        url: formatTemplateUrl(name),
                        contentType: "text/html",
                        dataType: "html",
                        cache: true,
                        success: function (template) {
                            templates[name] = Handlebars.compile(template);
                            callback(templates[name]);
                        },
                        error: function () {
                            templates[name] = function () {
                                return 'Template não encontrado';
                            };
                            callback(templates[name]);
                        }
                    });
                } else {
                    callback(templates[name]);
                }
            },
            compile: function ($destino, templateName, data) {
                var t = this;
                this.loadTemplate(templateName, function (template) {
                    t.preCompile();
                    $destino.html(template(data));
                    t.posCompile();
                });
            },
            compileInMain: function (templateName, data) {
                this.compile($(mainElement), templateName, data);
                $(mainElement).append('<div class="clear"></div>');
            },
            registerPartial: function (name) {
                $.get(formatPartialUrl(name), function (response) {
                    Handlebars.registerPartial(name, response);
                });
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