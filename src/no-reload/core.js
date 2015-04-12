/*global require*/
var Ajax = require('./ajax.js');
var Routes = require('./routes.js');
var Modules = require('./modules.js');
var Templates = require('./templates.js');
var WebSockets = require('./websockets.js');
var Events = require('./events.js');
var Forms = require('./forms.js');
var Intervals = require('./intervals.js');
var Timeouts = require('./timeouts.js');
var Prompt = require('./prompt.js');

/**
 * NoReload core class
 * @param {object} $        jQuery
 * @param {object} Ractive  Ractive
 */
var NoReload = function ($, Ractive) {
    'use strict';
    var NR = this,
        serverAddress = '',
        defaultRoute = '',
        lastRoute = null,
        route404 = null,

        isAjax = function (routeObj, params) {
            return routeObj.definition.type === 'ajax' && params === undefined;
        },

        /**
         * Takes appropriate action in accordance with the definition of the route
         * @param {Object} routeDef - The route definition
         * @param {Object} params
         */
        processRouteParams = function (routeDef, params) {
            NR.events.trigger('beforeLoad', params);

            if (routeDef.template) {
                NR.templates.load(routeDef.template.url).then(function (Component) {
                    if (routeDef.model) {
                        routeDef.template.data = new routeDef.model(params);
                    } else {
                        routeDef.template.data = params;
                    }
                    params.template = new Component(routeDef.template);

                    if (routeDef.controller) {
                        NR.call(routeDef.controller, params);
                    }

                    NR.events.trigger('afterLoad', params);

                });
            } else if (routeDef.controller) {
                NR.call(routeDef.controller, params);
                NR.events.trigger('afterLoad', params);
            }

        },

        /**
         * Routes the framework according to the type of the route
         * @param {Object}   routeObj - The route Object
         * @param {*} params
         */
        doRoute = function (routeObj, params) {
            if (isAjax(routeObj, params)) {
                NR.ajax.run({
                    url: routeObj.path,
                    type: 'get',
                    success: function (response) {
                        processRouteParams(routeObj.definition, {
                            data: response,
                            route: routeObj
                        });
                    }
                });
            } else {
                processRouteParams(routeObj.definition, {
                    data: params || {},
                    route: routeObj
                });
            }
        };

    this.ajax = new Ajax(this, $);
    this.events = new Events();
    this.modules = new Modules();
    this.routes = new Routes();
    this.templates = new Templates(Ractive, this.ajax);
    this.ws = new WebSockets();
    this.prompt = new Prompt();
    this.form = new Forms($, this, Ractive, this.prompt);
    this.intervals = new Intervals();
    this.timeouts = new Timeouts();

    /**
     * Perform an ajax call to start the system
     * @param {Object} options - Ajax.run params
     */
    this.start = function (options) {
        var opt = $.extend({
            url: options.url,
            success: function (response) {
                NR.call(options.controller, response);
            }
        }, options);

        this.ajax.run(opt);
    };

    /**
     * Changes the system state making call to a route
     * @param {string} [route=defaultRoute] - The name of the route
     * @param {*} params - Optional params for the route,
     *                            if a param is passed the rout is called of static form
     */
    this.load = function (route, params) {
        route = route || defaultRoute;

        var routeObj = this.routes.find(route);
        if (routeObj) {
            doRoute(routeObj, params);
        } else if (route404) {
            routeObj = this.routes.find(route404);
            if (routeObj) {
                doRoute(routeObj, params);
            }
        } else {
            throw "the route '" + route + "' has not yet been registered";
        }
        lastRoute = route;
    };

    this.reload = function (params) {
        this.load(lastRoute, params);
    };

    this.call = function (controller, params) {
        this.modules.call(controller, params);
    };

    this.startAnchorNavigation = function () {
        $(window).on('hashchange', function () {
            var name = location.hash.replace(/^#/, '');
            NR.load(name);
        });
    };

    this.registerBeforeLoadEvent = function (name, event) {
        this.events.on('beforeLoad', name, event);
    };
    this.unregisterBeforeLoadEvent = function (name) {
        this.events.off('beforeLoad', name);
    };
    this.registerAfterLoadEvent = function (name, event) {
        this.events.on('afterLoad', name, event);
    };
    this.unregisterAfterLoadEvent = function (name) {
        this.events.off('afterLoad', name);
    };

    this.getServerAddress = function () {
        return serverAddress;
    };
    this.setServerAddress = function (address) {
        serverAddress = address;
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
    this.getRoute404 = function () {
        return route404;
    };
    this.setRoute404 = function (routeName) {
        route404 = routeName;
    };
};

/*global module*/
module.exports = NoReload;
