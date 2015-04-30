/*global module, require*/
(function ($) {
    'use strict';

    function $Ajax() {
        return $.ajax;
    }

    module.exports = $Ajax;
}(window.jQuery));
