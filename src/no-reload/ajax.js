/**
 * Ajax
 */
var $ = window.jQuery,
    Ajax = function () {
        'use strict';
        var ajax = this,
            serverAddress = '';

        this.getServerAddress = function () {
            return serverAddress;
        };

        this.setServerAddress = function (address) {
            serverAddress = address;
        };

        /**
         * Default parameteres
         *
         * @returns {Object} default configuration.
         */
        this.getDefaultParams = function () {
            return {
                dataType: "json",
                beforeSend: ajax.beforeSend,
                complete: ajax.complete,
                error: ajax.error,
                cache: false
            };
        };

        /**
         * Function URL format
         * @param   {string} location - Route URI
         * @returns {string} Complete URL from server
         */
        this.prepareUrl = function (location) {
            return serverAddress + location;
        };

        this.error = function () {
            throw "Ajax Error";
        };
        this.beforeSend = function () {};
        this.complete = function () {};

        /**
         * Run a AJAX request
         * @param {Object} params - jQuery AJAX params
         */
        this.run = function (params) {
            var url = params.url || '';
            params.url = this.prepareUrl(url);

            params = $.extend(this.getDefaultParams(url), params);

            $.ajax(params);
        };
    };
/*global module*/
module.exports = Ajax;
