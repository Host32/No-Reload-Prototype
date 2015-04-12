/**
 * Module Manage class
 */
var Modules = function () {
    'use strict';
    var modules = this,
        registered = {},
        interceptors = {},

        /**
         * Search by function among the registered modules
         * @param   {String}   name - Path of the function
         * @returns {function} - A function that can be call the searched function
         */
        getFunc = function (name) {
            return function (params) {
                var names = name.split(';'),
                    key,
                    scope,
                    scopeSplit,
                    i;

                for (key in names) {
                    if (names.hasOwnProperty(key)) {
                        scope = registered;
                        scopeSplit = names[key].split('.');
                        for (i = 0; i < scopeSplit.length - 1; i += 1) {
                            scope = scope[scopeSplit[i]];

                            if (scope === undefined) {
                                break;
                            }
                        }
                        if (scope !== undefined && scope[scopeSplit[scopeSplit.length - 1]] !== undefined) {
                            scope[scopeSplit[scopeSplit.length - 1]](params);
                        }
                    }
                }
            };
        };

    this.register = function (name, Module) {
        registered[name] = new Module();
    };

    this.callInterceptors = function (params) {
        var name;
        for (name in interceptors) {
            if (interceptors.hasOwnProperty(name)) {
                interceptors[name](params);
            }
        }
    };
    this.registerInterceptor = function (name, func) {
        interceptors[name] = func;
    };

    /**
     * Call for the function name
     * @param {(string|function)} moduleFunc - The path of the function in the registered modules
     * @param {*} params - The params that be passed for the function
     */
    this.call = function (moduleFunc, params) {
        this.callInterceptors(params);

        if (typeof moduleFunc === 'string') {
            moduleFunc = getFunc(moduleFunc);
        }

        moduleFunc(params);
    };
};

/*global module*/
module.exports = Modules;
