/*global module, require*/
(function ($) {
    'use strict';

    function $ScriptLoader() {
        var defaultPath = '';

        function getDefaultPath() {
            return defaultPath;
        }

        function setDefaultPath(path) {
            defaultPath = path;
        }

        function formatPath(path) {
            return defaultPath + path;
        }

        function load(path) {
            $.getScript(formatPath(path));
        }

        return {
            getDefaultPath: getDefaultPath,
            setDefaultPath: setDefaultPath,
            load: load
        };
    }

    module.exports = $ScriptLoader;
}(window.jQuery));
