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

    var deferreds = {};

    var getTemplate = function (name, optionalName) {
        var alias = optionalName || name;

        if (typeof deferreds[name] === 'undefined') {
            deferreds[name] = $.ajax({
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
                        template: 'Template não encontrado',
                        oncomplete: function () {
                            callCompileEvents();
                        }
                    });
                }
            });
        }
        return deferreds[name];
    };
    var loadOne = function (name) {
        return new Ractive.Promise(function (resolve, reject) {
            getTemplate(name).done(function () {
                resolve(templates[name]);
            });
        });
    };
    var loadMultiple = function (map) {
        return new Ractive.Promise(function (resolve, reject) {
            var pendents = 0;
            var results = {};

            var load = function (name) {
                getTemplate(map[name], name).done(function () {
                    results[name] = templates[map[name]];
                    if (!--pendents) {
                        resolve(results);
                    }
                });
            };

            for (var name in map) {
                if (map.hasOwnProperty(name)) {
                    pendents += 1;
                    load(name);
                }
            }
        });
    };

    this.callCompileEvents = callCompileEvents;
    this.registerCompileEvent = function (name, callback) {
        compileEvents[name] = callback;
    };
    this.unregisterCompileEvent = function (name) {
        delete compileEvents[name];
    };
    this.load = function (map, callback) {
        var promisse;
        if (typeof map === 'string') {
            promisse = loadOne(map);
        } else {
            promisse = loadMultiple(map);
        }
        if (typeof callback === 'undefined')
            return promisse;
        else {
            promisse.then(callback);
        }
    };
    this.compile = function (options) {
        this.load(options.template).then(function (Component) {
            delete options.template;
            new Component(options);
        });
    };
    this.registerPartial = function (name) {
        $.get(formatPartialUrl(name), function (response) {
            Ractive.partials[name] = response;
        });
    };
    this.registerHelper = function (name, func) {
        Ractive.defaults.data[name] = func;
    };
    this.getTemplatePath = function () {
        return templatePath;
    };
    this.setTemplatePath = function (path) {
        templatePath = path;
    };
    this.getTemplateFormat = function () {
        return templateFormat;
    };
    this.setTemplateFormat = function (path) {
        templateFormat = path;
    };
    this.getPartialsPath = function () {
        return partialsPath;
    };
    this.setPartialsPath = function (path) {
        partialsPath = path;
    };
    this.getPartialsFormat = function () {
        return partialsFormat;
    };
    this.setPartialsFormat = function (path) {
        partialsFormat = path;
    };
    this.getMainElement = function () {
        return mainElement;
    };
    this.setMainElement = function (path) {
        mainElement = path;
    };
};