/*global module, require*/
(function () {
    'use strict';

    var appProvider = require('./core/app-provider'),
        helpers = require('./helpers');

    module.exports = helpers.extend({}, {
        app: appProvider
    }, helpers);
}());
