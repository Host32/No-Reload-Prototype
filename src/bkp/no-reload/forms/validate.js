var Validate = function ($, prompt) {
    'use strict';
    var validate = this,
        defaultLanguage = 'en',

        ALPHA_EXP = /^[a-z]+$/i,
        NATURAL_EXP = /^[0-9]+$/i,
        NUMBER_EXP = /^([\-]?[0-9]*[\.]?[0-9]*)$/i,
        ALPHA_NUMERIC_EXP = /^[a-z0-9]+$/i,
        ALPHA_DASH_EXP = /^[a-z0-9_\-]+$/i,
        EMAIL_EXP = /^([\w\-]+(?:\.[\w\-]+)*)@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        EMAILS_EXP = /^((^([\w\-]+(?:\.[\w\-]+)*)@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?))([,]?))+$/,
        IP_EXP = /^[\d]{1,3}(\.([\d]{1,3})){3}$/,

        RULE_PARAM_EXP = /\[([\w]*)\]/,

        validations = {
            required: function (value) {
                if (typeof value === 'string') {
                    return value.trim().length > 0;
                }

                return typeof value !== 'undefined' && value !== null;
            },
            matches: function (value, seletor) {
                /*jslint eqeq:true*/
                return value == $(seletor).val();
            },
            min_length: function (value, length) {
                return value.length >= length;
            },
            max_length: function (value, length) {
                return value.length <= length;
            },
            exact_length: function (value, length) {
                /*jslint eqeq:true*/
                return value.length == length;
            },
            greater_than: function (value, number) {
                return NUMBER_EXP.test(value) && parseInt(value, 10) >= number;
            },
            less_than: function (value, number) {
                return NUMBER_EXP.test(value) && parseInt(value, 10) <= number;
            },
            alpha: function (value) {
                return ALPHA_EXP.test(value);
            },
            alpha_numeric: function (value) {
                return ALPHA_NUMERIC_EXP.test(value);
            },
            alpha_dash: function (value) {
                return ALPHA_DASH_EXP.test(value);
            },
            numeric: function (value) {
                return (value - parseFloat(value) + 1) >= 0;
            },
            is_natural: function (value) {
                return NATURAL_EXP.test(value);
            },
            valid_email: function (value) {
                return EMAIL_EXP.test(value);
            },
            valid_emails: function (value) {
                return EMAILS_EXP.test(value);
            },
            valid_ip: function (value) {
                return IP_EXP.test(value);
            }
        },
        validationErrors = {
            en: {
                required: '',
                matches: '',
                min_length: '',
                max_length: '',
                exact_length: '',
                greater_than: '',
                less_than: '',
                alpha: '',
                alpha_numeric: '',
                alpha_dash: '',
                numeric: '',
                is_natural: '',
                valid_email: '',
                valid_emails: '',
                valid_ip: ''
            },
            ptbr: {
                required: 'O campo $1 é obrigatório.',
                matches: 'O campo valor no campo $1 não é idêntico ao valor de outro campo.',
                min_length: 'O campo $1 precisa de no mínimo $2 characteres.',
                max_length: 'O campo $1 pode ter no máximo $2 characteres.',
                exact_length: 'O campo $1 precisa de exatamente $2 characteres.',
                greater_than: 'O campo $1 deve conter um valor de no mínimo $2.',
                less_than: 'O campo $1 deve conter um valor de no máximo $2.',
                alpha: 'O campo $1 aceita somente letras.',
                alpha_numeric: 'O campo $1 aceita somente letras e números',
                alpha_dash: 'O campo $1 aceita somente letras, números, underlines e traços.',
                numeric: 'O campo $1 só aceita valores numéricos',
                is_natural: 'O campo $1 só aceita numeros naturais.',
                valid_email: 'O campo $1 precisa de um email válido.',
                valid_emails: 'O campo $1 só aceita uma lista de emails válidos separados por vírgula.',
                valid_ip: 'O campo $1 só aceita endereços de IP válidos.'
            }
        };

    this.registerValidation = function (name, func, messages) {
        validations[name] = func;

        messages = messages || {};
        var lang;
        for (lang in messages) {
            if (messages.hasOwnProperty(lang)) {
                this.registerLang(lang);
                validationErrors[lang][name] = messages[lang];
            }
        }
    };
    this.registerValidationMessage = function (name, lang, message) {
        this.registerLang(lang);
        validationErrors[lang][name] = message;
    };
    this.registerLang = function (lang) {
        if (typeof validationErrors[lang] === 'undefined') {
            validationErrors[lang] = {};
        }
    };
    this.setLanguage = function (lang) {
        defaultLanguage = lang;
    };
    this.validate = function (rule, value, param) {
        return (typeof validations[rule] === 'function') ? validations[rule](value, param) : true;
    };
    this.showError = function (errorMessage, field) {
        var errorDest = $(field).attr('nr-error-field') || false;
        if (errorDest) {
            $(errorDest).html(errorMessage);
        }
    };
    this.errorMessage = '';
    this.field = function (field) {
        var $field = $(field),
            rules = $field.data('validate') || '',
            rule,
            rulesSplit,
            ruleKey,
            params,
            param,
            value;

        if (rules.length > 0) {
            rulesSplit = rules.split('|');

            for (ruleKey in rulesSplit) {
                if (rulesSplit.hasOwnProperty(ruleKey)) {
                    params = rulesSplit[ruleKey].match(RULE_PARAM_EXP);
                    param = params !== null ? params[0].replace('[', '').replace(']', '') : null;
                    rule = rulesSplit[ruleKey].replace(RULE_PARAM_EXP, '');

                    value = $field.attr('type') === 'checkbox' ? $field.prop('checked') : $field.val();

                    if (!this.validate(rule, value, param)) {
                        this.errorMessage = validationErrors[defaultLanguage][rule]
                            .replace('$1', $field.data('name') || $field.attr('name'))
                            .replace('$2', param);

                        this.showError(this.errorMessage, $field);

                        return false;
                    }
                }
            }
        }
        return true;
    };
    this.form = function (form, showPopup) {
        var errorMessage = '',
            foundError = false;
        $(form).find(':input').each(function () {
            if (!validate.field($(this))) {
                foundError = true;
                errorMessage += validate.errorMessage + '\n';
            }
        });

        if (foundError && showPopup) {
            prompt.error(errorMessage);
        }

        return !foundError;
    };
};

/*global module*/
module.exports = Validate;
