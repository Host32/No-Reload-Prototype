/*global module, require*/
(function (helpers) {
    'use strict';

    module.exports = {
        dependencies: {},
        register: function (key, value) {
            this.dependencies[key] = value;
        },
        resolve: function (definition, scope) {
            var func = function () {},
                deps = [],
                args = [],
                self = this;

            if (helpers.isFunction(definition)) {
                func = definition;
                deps = func.toString().match(/^[function\s]*[\(]*\(\s*([\w,\s]*)\)/m)[1].replace(/ /g, '').split(',');
            } else if (helpers.isArray(definition)) {
                func = definition[definition.length - 1];
                deps = definition.splice(-1, 1);
            }
            return function () {
                var i, d;
                for (i = 0; i < deps.length; i += 1) {
                    d = deps[i];
                    if (self.dependencies[d] && d !== '') {
                        args.push(self.dependencies[d]);
                    }
                }
                func.apply(scope || {}, args);
            };
        }
    };
}(require('./helpers.js')));
