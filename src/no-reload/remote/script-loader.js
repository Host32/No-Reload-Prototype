/*global module, require*/
(function ($) {
    'use strict';

    function $ScriptLoader() {
        var defaultPath = '',
            defaultFormat = '.js',
            ajaxCache = true;

        function getDefaultPath() {
            return defaultPath;
        }

        function setDefaultPath(path) {
            defaultPath = path;
        }

        function getDefaultFormat() {
            return defaultFormat;
        }

        function setDefaultFormat(format) {
            defaultFormat = format;
        }

        function formatPath(path) {
            return defaultPath + path + defaultFormat;
        }

        function load(path) {
            $.ajax({
                dataType: "script",
                cache: ajaxCache,
                url: formatPath(path)
            });
        }

        function setCache(cache) {
            ajaxCache = cache;
        }

        return {
            getDefaultPath: getDefaultPath,
            setDefaultPath: setDefaultPath,
            getDefaultFormat: getDefaultFormat,
            setDefaultFormat: setDefaultFormat,
            load: load,
            setCache: setCache
        };
    }

    module.exports = $ScriptLoader;
}(window.jQuery));
