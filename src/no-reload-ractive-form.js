(function (NR, $, Ractive) {
    'use strict';
    var Form = function (NR, $, Ractive) {
        var formSeletor = 'form';

        var defaultLanguage = 'en';

        var ALPHA_EXP = /^[a-z]+$/i;
        var NATURAL_EXP = /^[0-9]+$/i;
        var NUMBER_EXP = /^([-]?[0-9]*[\.]?[0-9]*)$/i;
        var ALPHA_NUMERIC_EXP = /^[a-z0-9]+$/i;
        var ALPHA_DASH_EXP = /^[a-z0-9_-]+$/i;
        var EMAIL_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var EMAILS_EXP = /^((([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))([,]?))+$/;
        var IP_EXP = /^[\d]{1,3}(\.([\d]{1,3})){3}$/;

        var RULE_PARAM_EXP = /(\[(.*)\])/;

        var validations = {
            required: function (value) {
                if (typeof value === 'string') {
                    if (value.toLowerCase() === 'true') value = true;
                    else if (value.toLowerCase() === 'false') value = false;
                    else return value.length > 0;
                }

                return typeof value !== 'undefined' && value !== false && value !== null;
            },
            matches: function (value, seletor) {
                return value == $(seletor).val();
            },
            min_length: function (value, length) {
                return value.length >= length;
            },
            max_length: function (value, length) {
                return value.length <= length;
            },
            exact_length: function (value, length) {
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
        };
        var validationErrors = {
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

        function extractReloadController(reloadString) {
            if (reloadString === true) return reloadString;
            return reloadString.toLowerCase() === 'false' ? false : (reloadString.toLowerCase() === 'true' ? true : reloadString);
        }

        var validationErrorMessage = '';
        this.registerValidation = function (name, func, messages) {
            validations[name] = func;

            messages = messages || [];

            for (var key in messages) {
                this.registerLang(messages[key].lang);
                validationErrors[messages[key].lang][name] = messages[key].message;
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
        this.printErrorValidation = function (field, errorMessage) {
            var errorDest = $(field).attr('error-field') || false;
            if (errorDest) {
                $(errorDest).html(errorMessage);
            }
        };
        this.validateField = function (field) {
            var $field = $(field);
            var rules = $field.attr('rules') || '';

            if (rules.length > 0) {
                var aRules = rules.split('|');

                for (var key in aRules) {
                    var params = aRules[key].match(RULE_PARAM_EXP);
                    var param = params !== null ? params[0].replace('[', '').replace(']', '') : null;
                    var rule = aRules[key].replace(RULE_PARAM_EXP, '');

                    var value = $field.attr('type') === 'checkbox' ? $field.prop('checked') : $field.val();

                    if (!this.validate(rule, value, param)) {
                        validationErrorMessage = validationErrors[defaultLanguage][rule]
                            .replace('$1', $field.attr('validation-name'))
                            .replace('$2', param);

                        this.printErrorValidation($field, validationErrorMessage);

                        return false;
                    }
                }
            }
            return true;
        };
        this.prompt = function (errorMessage) {
            alert(errorMessage);
        };
        this.promptQuestion = function (message, callback) {
            var confirmacao = confirm(message);
            if (confirmacao) {
                callback();
            }
        };
        this.validateForm = function (form, showPopup) {
            var t = this;
            var errorMessage = '';
            var foundError = false;
            $(form).find(':input').each(function () {
                if (!t.validateField($(this))) {
                    foundError = true;
                    errorMessage += validationErrorMessage + '\n';
                }
            });

            if (foundError && showPopup) {
                this.prompt(errorMessage);
            }

            return !foundError;
        };
        this.getCompEl = function (comp) {
            return $('#' + comp.get('id'));
        }
        this.getFormOptions = function (comp) {
            var contentType = (comp.get('contentType') || 'application/x-www-form-urlencoded; charset=UTF-8');
            var data = (contentType === 'application/json') ? JSON.stringify(comp.get("item")) : this.getCompEl(comp).serialize();

            var options = {
                url: comp.get('action'),
                type: (comp.get('method') || 'get'),
                reload: extractReloadController(comp.get('reload') || 'false'),
                callback: (comp.get('callback') || false),
                question: (comp.get('question') || false),
                dataType: (comp.get('data-type') || "json"),
                contentType: contentType,
                data: data
            };

            console.log(options);
            return options;
        };
        this.send = function (options) {
            //form, type, location, data, callback, reload, dataType, contentType) {
            var callback = options.callback || false;
            var reload = options.reload || false;

            options.success = function (response) {
                if (options.form) {
                    var event = new Event('response', {
                        data: response
                    });
                    form.trigger(event);
                }

                if (callback) {
                    NR.modules.call(callback, response);
                }
                if (reload === true) {
                    NR.reload(response);
                } else if (reload) {
                    NR.load(reload, response);
                }
            };

            NR.ajax.run(options);
        };

        this.submit = function (comp) {
            var showPopup = comp.get('showErrorPopup') || 'true';
            showPopup = showPopup.toLowerCase() === 'false' ? false : true;

            if (this.validateForm(this.getCompEl(comp), showPopup)) {
                var options = this.getFormOptions(comp);

                if (options.question) {
                    var f = this;
                    this.promptQuestion(options.question, function () {
                        f.send(options);
                    });
                } else {
                    this.send(options);
                }
            }
        };
    };

    NR.form = new Form(NR, $, Ractive);

    $(document).on('submit', '.nr-form', function (e) {
        e.preventDefault();
    });

    var formWidget = Ractive.extend({
        template: '<form item="{{item}}" id="{{id}}" class="nr-form {{class}}" action="{{action}}" method="{{method || "get"}}" contentType="{{contentType || "application/x-www-form-urlencoded; charset=UTF-8"}}" reload="{{reloat || "false"}}" {{#if question}}question="{{question}}"{{/if}} {{#if callback}}callback="{{callback}}"{{/if}} {{#if showErrorPopup}}showErrorPopup="{{showErrorPopup}}"{{/if}} on-submit="envia">{{>content}}</form>',
        onrender: function () {

            this.on('envia', function () {
                NR.form.submit(this);
            });
        }
    });

    Ractive.components.nrForm = formWidget;
})(NoReload, jQuery, Ractive);
