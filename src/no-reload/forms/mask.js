var Mask = function ($) {
    'use strict';
    var mask = this,
        registered = {
            uppercase: function (value) {
                return typeof value === 'string' ? value.toUpperCase() : value;
            },
            lowercase: function (value) {
                return typeof value === 'string' ? value.toLowerCase() : value;
            }
        };

    this.format = function (rule, value) {
        return typeof registered[rule] === 'function' ? registered[rule](value) : value;
    };
    this.register = function (name, func) {
        registered[name] = func;
    };

    this.form = function (form) {
        $(form).find(':input').each(function () {
            mask.field(this);
        });
    };

    this.field = function (field) {
        $(field).on('keyup', function () {
            var value = $(this).val(),
                rules = $(this).data('mask'),
                rulesSplit = rules.split('|'),
                rulesSplitKey;

            for (rulesSplitKey in rulesSplit) {
                if (rulesSplit.hasOwnProperty(rulesSplitKey)) {
                    value = mask.format(rulesSplit[rulesSplitKey], value);
                }
            }
            $(this).val(value);
        });

    };
};

/*global module*/
module.exports = Mask;
