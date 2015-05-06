/*global module, require*/
(function () {
    'use strict';

    var helpers = require('../helpers'),
        extend = helpers.extend;

    function $Server($ajax) {
        var instance,
            serverAddress = '',
            defaultParams,
            interceptors = {
                beforeSend: [],
                error: [],
                success: [],
                complete: []
            },

            prepareUrl = function (location) {
                return serverAddress + location;
            };

        function error() {
            throw "Server Error";
        }

        function beforeSend() {}

        function complete() {}

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

        function registerInterceptor(phase, interceptor) {
            phase = phase || 'success';
            if (!interceptors[phase]) {
                interceptors[phase] = [];
            }
            interceptors[phase].push(interceptor);
        }

        function createInterceptFunc(userFunc, phase) {
            return function (response) {
                var i;
                for (i = 0; i < interceptors[phase].length; i += 1) {
                    interceptors[phase][i](response);
                }
                if (userFunc) {
                    userFunc(response);
                }
            };
        }

        function createInterceptors(params) {
            params.beforeSend = createInterceptFunc(params.beforeSend, 'beforeSend');
            params.error = createInterceptFunc(params.error, 'error');
            params.success = createInterceptFunc(params.success, 'success');
            params.complete = createInterceptFunc(params.complete, 'complete');

            return params;
        }

        function run(params) {
            var url = params.url || '';
            params.url = instance.prepareUrl(url);

            params = createInterceptors(params);

            return $ajax(params);
        }

        function get(url, callback) {
            var params = extend({}, defaultParams, {
                url: instance.prepareUrl(url),
                type: 'get',
                success: callback
            });

            params = createInterceptors(params);

            return $ajax(params);
        }

        instance = {
            getServerAddress: getServerAddress,
            setServerAddress: setServerAddress,
            getDefaultParams: getDefaultParams,
            setDefaultParams: setDefaultParams,
            prepareUrl: prepareUrl,
            request: run,
            get: get,
            registerInterceptor: registerInterceptor
        };

        defaultParams = {
            dataType: "json",
            cache: false
        };

        return instance;
    }

    module.exports = $Server;
}());
