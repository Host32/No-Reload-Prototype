var Ajax = require('./ajax.js');
var Routes = require('./routes.js');
var Modules = require('./modules.js');
var Templates = require('./templates.js');
var WebSocket = require('./websocket.js');

module.exports = function ($) {
    'use strict';
    var serverAddress = '';
    var lastRoute = null;
    var defaultRoute = '';

    var reloadPolicy = {
        USE_RESPONSE: 0,
        NEW_REQUEST: 1
    };
    var selectedReloadPolicy = 0;

    var beforeLoadEvents = {};
    var afterLoadEvents = {};


    var utils = {
        objectMerge: function (ob1, ob2) {
            for (var key in ob2) {
                ob1[key] = ob2[key];
            }
            return ob1;
        },
        convertResponse: function (response) {
            if (typeof response === 'string')
                response = JSON.parse(response);

            return response;
        }
    };

    var beforeLoad = function () {
        for (var key in beforeLoadEvents) {
            beforeLoadEvents[key]();
        }
    };
    var afterLoad = function () {
        for (var key in afterLoadEvents) {
            afterLoadEvents[key]();
        }
    };

    var ajax = new Ajax($);
    var modules = new Modules();
    var routes = new Routes();
    var template = new Templates($, Ractive);
    var ws = new WebSocket();

    function isAjax(routeDef, params) {
        return routeDef.definition.ajax && (selectedReloadPolicy === reloadPolicy.NEW_REQUEST || typeof params === 'undefined');
    }

    var __export__ = {
        reloadPolicy: reloadPolicy,
        beforeLoad: beforeLoad,
        afterLoad: afterLoad,
        utils: utils,
        ajax: ajax,
        modules: modules,
        routes: routes,
        template: template,
        ws: ws,
        startAnchorNavigation: function () {
            var NR = this;
            $(window).on('hashchange', function () {
                var name = location.hash.replace(/^#/, '');
                NR.load(name);
            });
        },
        registerBeforeLoadEvent: function (name, event) {
            beforeLoadEvents[name] = event;
        },
        unregisterBeforeLoadEvent: function (name) {
            delete beforeLoadEvents[name];
        },
        registerAfterLoadEvent: function (name, event) {
            afterLoadEvents[name] = event;
        },
        unregisterAfterLoadEvent: function (name) {
            delete afterLoadEvents[name];
        },
        start: function (options) {
            var opt = $.extend({}, {
                url: options.url,
                success: function (response) {
                    NR.call(options.controller, response)
                }
            }, options);

            ajax.run(opt);
        },
        reload: function () {
            this.load(lastRoute);
        },
        load: function (route, params) {
            route = route || defaultRoute;
            var routeDef = routes.find(route);
            var NR = this;
            if (routeDef) {
                if (isAjax(routeDef, params)) {
                    ajax.run({
                        url: routeDef.serverRoute,
                        type: 'get',
                        success: function (response) {
                            response.route = routeDef;
                            NR.call(routeDef.definition.controller, response);
                        }
                    });
                } else {
                    params = params || {};
                    params.route = routeDef;
                    NR.call(routeDef.definition.controller, params);
                }
                lastRoute = route;
            } else {
                throw "the route '" + route + "' has not yet been registered";
            }
        },
        call: function (controller, params) {
            this.beforeLoad();
            modules.safeCall(controller, params);
            this.afterLoad();
        },
        getCurrentRoute: function () {
            return lastRoute;
        },
        getDefaultRoute: function () {
            return defaultRoute;
        },
        setDefaultRoute: function (route) {
            defaultRoute = route;
        },
        getServerAddress: function () {
            return serverAddress;
        },
        setServerAddress: function (address) {
            serverAddress = address;
        },
        setReloadPolicy: function (policy) {
            selectedReloadPolicy = policy;
        }
    };

    return __export__;
};
