/*global module, require*/
(function () {
    'use strict';

    var Ajax = require('./ajax.js'),
        Routes = require('./routes.js'),
        Modules = require('./modules.js'),
        Templates = require('./templates.js'),
        WebSockets = require('./websockets.js'),
        Events = require('./events.js'),
        Forms = require('./forms/forms.js'),
        Intervals = require('./intervals.js'),
        Timeouts = require('./timeouts.js'),
        Prompt = require('./prompt.js'),

        /**
         * NoReload core class
         * @param {object} $        jQuery
         * @param {object} Ractive  Ractive
         */
        NoReload = function ($, Ractive) {
            var NR = this,
                serverAddress = '',
                defaultRoute = '',
                lastRoute = null,
                route404 = null,
                autoRenderTemplate = false,

                isAjax = function (routeObj, params) {
                    return routeObj.definition.type === 'ajax' && params === undefined;
                },

                getTemplateUrl = function (templateDef) {
                    return (typeof templateDef === 'string') ? templateDef : templateDef.url;
                },

                isAutoRenderTemplate = function (templateDef) {
                    return (templateDef.autoRender === undefined && autoRenderTemplate) || templateDef.autoRender;
                },

                formatTemplateOptions = function (templateDef, data) {
                    if (typeof templateDef === 'string') {
                        return {
                            data: data
                        };
                    } else {
                        if (isAutoRenderTemplate(templateDef)) {
                            templateDef.data = data;
                        }
                        return templateDef;
                    }
                },

                formatData = function (routeDef, data) {
                    return routeDef.dataFilter ? routeDef.dataFilter(data) : data;
                },

                createControllerParams = function (route, data, template) {
                    return {
                        route: route,
                        data: data,
                        template: template
                    };
                },

                /**
                 * Takes appropriate action in accordance with the definition of the route
                 * @param {Object} routeDef - The route definition
                 * @param {Object} params
                 */
                processRouteParams = function (routeObj, params) {
                    var routeDef = routeObj.definition;

                    NR.events.trigger('beforeLoad', params);

                    if (routeDef.template) {
                        NR.templates.load(getTemplateUrl(routeDef.template)).then(function (Component) {
                            var data, template, templateOpt;

                            data = formatData(routeDef, params);
                            templateOpt = formatTemplateOptions(routeDef.template, data);

                            if (isAutoRenderTemplate(routeDef.template)) {
                                template = new Component(templateOpt);
                            } else {
                                template = Component.extend(templateOpt);
                            }

                            if (routeDef.controller) {
                                NR.call(routeDef.controller, createControllerParams(routeObj, data, template));
                            } else {
                                NR.modules.callInterceptors(createControllerParams(routeObj, data, template));
                            }

                            NR.events.trigger('afterLoad', params);

                        });
                    } else if (routeDef.controller) {
                        NR.call(routeDef.controller, createControllerParams(routeObj, params));
                        NR.events.trigger('afterLoad', params);
                    } else {
                        NR.modules.callInterceptors(createControllerParams(routeObj, params));
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
                                processRouteParams(routeObj, response);
                            }
                        });
                    } else {
                        processRouteParams(routeObj, params);
                    }
                };

            this.ajax = new Ajax(this, $);
            this.events = new Events();
            this.modules = new Modules();
            this.routes = new Routes();
            this.templates = new Templates(Ractive, $);
            this.ws = new WebSockets();
            this.prompt = new Prompt();
            this.form = new Forms($, this, Ractive, this.prompt);
            this.intervals = new Intervals();
            this.timeouts = new Timeouts();


            this.controllers = {};
            this.states = {};
            this.configs = [];
            this.autoRun = [];

            /**
             * Perform an ajax call to start the system
             * @param {Object} options - Ajax.run params
             */
            this.start = function (options) {
                var opt = $.extend({
                    url: options.url,
                    success: function (response) {
                        NR.call(options.controller, createControllerParams(options, response));
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
                /*global window*/
                /*global location*/
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
            this.setAutoRenderTemplate = function (autoRender) {
                autoRenderTemplate = autoRender;
            };
        };

    module.exports = NoReload;
}());
