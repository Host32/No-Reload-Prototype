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
    var route404 = null;

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
    var template = new Templates($, Ractive);
    var routes = new Routes(template);
    var ws = new WebSocket();

    function isAjax(routeDef, params) {
        return routeDef.definition.ajax && (selectedReloadPolicy === reloadPolicy.NEW_REQUEST || typeof params === 'undefined');
    }

    this.reloadPolicy = reloadPolicy;
    this.beforeLoad = beforeLoad;
    this.afterLoad = afterLoad;
    this.utils = utils;
    this.ajax = ajax;
    this.modules = modules;
    this.routes = routes;
    this.template = template;
    this.ws = ws;
    this.startAnchorNavigation = function () {
        var NR = this;
        $(window).on('hashchange', function () {
            var name = location.hash.replace(/^#/, '');
            NR.load(name);
        });
    };
    this.registerBeforeLoadEvent = function (name, event) {
        beforeLoadEvents[name] = event;
    };
    this.unregisterBeforeLoadEvent = function (name) {
        delete beforeLoadEvents[name];
    };
    this.registerAfterLoadEvent = function (name, event) {
        afterLoadEvents[name] = event;
    };
    this.unregisterAfterLoadEvent = function (name) {
        delete afterLoadEvents[name];
    };
    this.start = function (options) {
        var opt = $.extend({}, {
            url: options.url,
            success: function (response) {
                NR.call(options.controller, response)
            }
        }, options);

        ajax.run(opt);
    };
    this.reload = function (params) {
        this.load(lastRoute, params);
    };
    this.load = function (route, params) {
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
        } else if (route404) {
            routeDef = routes.find(route404);
            if (routeDef) {
                this.load(route404);
            }
        } else {
            throw "the route '" + route + "' has not yet been registered";
        }
    };
    this.call = function (controller, params) {
        this.beforeLoad();
        modules.safeCall(controller, params);
        this.afterLoad();
    };
    this.getCurrentRoute = function () {
        return lastRoute;
    };
    this.getDefaultRoute = function () {
        return defaultRoute;
    };
    this.setDefaultRoute = function (route) {
        defaultRoute = route;
    };
    this.getServerAddress = function () {
        return serverAddress;
    };
    this.setServerAddress = function (address) {
        serverAddress = address;
    };
    this.setReloadPolicy = function (policy) {
        selectedReloadPolicy = policy;
    };
    this.setRoute404 = function (routeName) {
        route404 = routeName;
    };
};
