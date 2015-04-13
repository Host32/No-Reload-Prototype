/*global window*/
(function () {
    'use strict';

    window.Ractive.DEBUG = false;

    /*global require*/
    var NoReload = require('./no-reload/core.js');

    window.NR = window.NoReload = new NoReload(window.jQuery, window.Ractive);
}());
