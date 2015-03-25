module.exports = function () {
    this.registred = {};
    this.register = function (name, module) {
        this.registred[name] = new module();
    };
    this.validator = function () {
        return true;
    };
    this.call = function (moduleFunc, params) {
        if (typeof moduleFunc === 'string')
            moduleFunc = this.getFunc(moduleFunc);

        moduleFunc(params);
    };
    this.safeCall = function (module, params) {
        if (this.validator(params)) {
            this.call(module, params);
        }
    };
    this.getFunc = function (name) {
        var c = this;
        return function (params) {
            var names = name.split(';');
            for (var key in names) {
                var scope = c.registred;
                var scopeSplit = name.split('.');
                for (var i = 0; i < scopeSplit.length - 1; i++) {
                    scope = scope[scopeSplit[i]];

                    if (scope === undefined) break;
                }
                if (scope === undefined || scope[scopeSplit[scopeSplit.length - 1]] === undefined) continue;
                scope[scopeSplit[scopeSplit.length - 1]](params);
            }
        };
    };
    this.get = function (name) {
            var scope = this.registred;
            var scopeSplit = name.split('.');
            for (var i in scopeSplit) {
                scope = scope[scopeSplit[i]];

                if (scope == undefined) return null;
            }
            return scope;
        },
        this.set = function (name, value) {
            var scope = this.registred;
            var scopeSplit = name.split('.');
            for (var i = 0; i < scopeSplit.length - 1; i++) {
                scope = scope[scopeSplit[i]];

                if (scope == undefined) throw 'Scope ' + name + ' has not found in registred controllers';
            }
            scope[scopeSplit[scopeSplit.length - 1]] = value;
        };
};