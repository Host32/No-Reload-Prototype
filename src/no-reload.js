(function () {
    'use strict';

    /*global require*/
    var NoReload = require('./no-reload/core.js');

    window.NR = window.NoReload = new NoReload(window.jQuery, window.Ractive);
}());
