/*global module, require*/
(function ($) {
    'use strict';

    function $ScriptLoader() {
        var defaultPath = '',
            defaultFormat = '.js';

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
            $.getScript(formatPath(path));
        }

        return {
            getDefaultPath: getDefaultPath,
            setDefaultPath: setDefaultPath,
            getDefaultFormat: getDefaultFormat,
            setDefaultFormat: setDefaultFormat,
            load: load
        };
    }

    module.exports = $ScriptLoader;
}(window.jQuery));
