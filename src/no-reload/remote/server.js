/*global module, require*/
(function () {
    'use strict';

    var helpers = require('../helpers'),
        extend = helpers.extend;

    function $Server($ajax) {
        var instance,
            serverAddress = '',
            defaultParams,
            interceptors = [],

            prepareUrl = function (location) {
                return serverAddress + location;
            },

            error = function () {
                throw "Server Error";
            },

            beforeSend = function () {},

            complete = function () {};

        function setDefaultParams(params) {
            defaultParams = params;
        }

        function getDefaultParams() {
            return defaultParams;
        }

        function getServerAddress() {
            return serverAddress;
        }

        function setServerAddress(address) {
            serverAddress = address;
        }

        function registerInterceptor(interceptor) {
            interceptors.push(interceptor);
        }

        function createSuccessFunc(userSuccessFunc) {
            return function (response) {
                var i;
                for (i = 0; i < interceptors.length; i += 1) {
                    interceptors[i](response);
                }
                if (userSuccessFunc) {
                    userSuccessFunc(response);
                }
            };
        }

        function run(params) {
            var url = params.url || '';
            params.url = instance.prepareUrl(url);
            params.success = createSuccessFunc(params.success);

            params = extend({}, defaultParams, params);

            return $ajax(params);
        }

        function get(url, callback) {
            var params = extend({}, defaultParams, {
                url: instance.prepareUrl(url),
                type: 'get',
                success: createSuccessFunc(callback)
            });

            return $ajax(params);
        }

        instance = {
            getServerAddress: getServerAddress,
            setServerAddress: setServerAddress,
            getDefaultParams: getDefaultParams,
            setDefaultParams: setDefaultParams,
            prepareUrl: prepareUrl,
            error: error,
            beforeSend: beforeSend,
            complete: complete,
            request: run,
            get: get,
            registerInterceptor: registerInterceptor
        };

        defaultParams = {
            dataType: "json",
            beforeSend: instance.beforeSend,
            complete: instance.complete,
            error: instance.error,
            cache: false
        };

        return instance;
    }

    module.exports = $Server;
}());
