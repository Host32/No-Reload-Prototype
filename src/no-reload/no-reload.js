/*global module, require*/
(function () {
    'use strict';

    var appProvider = require('./core/app'),
        helpers = require('./core/helpers'),

        apps = {};


    function get(name) {
        if (!apps[name]) {
            apps[name] = appProvider.create();
        }
        return apps[name];
    }

    module.exports = helpers.extend({
        app: get
    }, helpers);
}());
