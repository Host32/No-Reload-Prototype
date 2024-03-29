/*global module, require*/
(function (Ractive) {
    'use strict';

    function TemplateLoaderProvider($ajax) {
        var templatePath = '',
            templateFormat = '',
            cache = {},
            deferreds = {},
            ajaxCache = true;

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
                deferreds[path] = $ajax({
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

        return {
            load: load,
            getTemplatePath: getTemplatePath,
            setTemplatePath: setTemplatePath,
            getTemplateFormat: getTemplateFormat,
            setTemplateFormat: setTemplateFormat,
            formatTemplateUrl: formatTemplateUrl
        };
    }

    module.exports = TemplateLoaderProvider;
}(window.Ractive));
