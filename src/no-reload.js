/*global window, require*/
(function ($, Ractive) {
    'use strict';

    var NR = require('./no-reload/no-reload'),
        Retro = require('./retro/core'),
        retro = new Retro($, Ractive);

    window.NR = window.NoReload = NR.extend(NR, retro);
}(window.jQuery, window.Ractive));
