/**
 * Template manager
 * @param   {Object} Ractive - Ractive
 * @param   {Object} ajax - Ajax
 */
var Templates = function (Ractive, $) {
    'use strict';
    var templates = this,
        templatePath = '',
        templateFormat = '.ract',
        partialsPath = '',
        partialsFormat = '.ract',

        ajaxCache = true,

        mainElement = 'body',

        cache = {},
        deferreds = {},

        /**
         * Do the ajax call looking for template
         * @param   {string} path - The URI of the template
         * @returns {Object} - A deferreds with the ajax result
         */
        getTemplate = function (path) {
            if (deferreds[path] === undefined) {
                deferreds[path] = $.ajax({
                    url: templates.formatTemplateUrl(path),
                    contentType: "text/html",
                    dataType: "html",
                    cache: ajaxCache,
                    success: function (template) {
                        cache[path] = templates.createRactive(template);
                    },
                    error: function () {
                        cache[path] = templates.createRactive('Template não encontrado');
                    }
                });
            }
            return deferreds[path];
        },
        /**
         * Return a promisse with a Ractive with the template file contents
         * @param   {string} path - The URI of the template
         * @returns {Object}
         */
        loadOne = function (path) {
            return new Ractive.Promise(function (resolve, reject) {
                getTemplate(path).done(function () {
                    resolve(cache[path]);
                });
            });
        },
        /**
         * Load multiple template files
         * @param   {Object} map - A list of templates
         * @returns {Object} - A promise with a Ractive with the template files contents
         */
        loadMultiple = function (map) {
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
        };

    /**
     * A load interface that can receive a string or a Object
     * and wrapp the request for a loadSingle or a loadMultiple template
     * @param   {(Object|string)} map - The template URI
     * @param   {function} [callback] - Optiona, can be used in 'then' callback of the promisse
     * @returns {Object} - Promise with the template
     */
    this.load = function (map, callback) {
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
    };

    /**
     * Wrapper load that already makes the new object
     * @param {Object}   options  - New instance options
     * @param {function} [callback] - callback tha will be receiver the compiled object
     */
    this.compile = function (options, callback) {
        this.load(options.url).then(function (Component) {
            var component = new Component(options);

            if (typeof callback === 'function') {
                callback(component);
            }
        });
    };

    /**
     * Create a default Ractive object using the main element and the template
     * @param   {string} template
     * @returns {Object}
     */
    this.createRactive = function (template) {
        return Ractive.extend({
            el: mainElement,
            template: template
        });
    };

    this.registerPartial = function (path) {
        $.ajax({
            url: templates.formatPartialUrl(path),
            contentType: "text/html",
            dataType: "html",
            cache: ajaxCache,
            success: function (response) {
                Ractive.partials[path] = response;
            }
        });
    };
    this.registerHelper = function (name, func) {
        Ractive.defaults.data[name] = func;
    };

    this.formatTemplateUrl = function (name) {
        return templatePath + name + templateFormat;
    };
    this.formatPartialUrl = function (name) {
        return partialsPath + name + partialsFormat;
    };

    // Main element *etters
    this.getMainElement = function () {
        return mainElement;
    };
    this.setMainElement = function (path) {
        mainElement = path;
    };

    // Template *etters
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

    // Partial *etters
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
};

/*global module*/
module.exports = Templates;
