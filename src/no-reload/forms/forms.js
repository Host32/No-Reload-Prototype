/*global require*/
var Validate = require('./validate.js');
var Mask = require('./mask.js');
var Forms = function ($, NR, Ractive, prompt) {
    'use strict';
    var forms = this,

        formWidget = Ractive.extend({
            template: '<form id="{{this["nr-form-id"]}}" class="nr-form {{class}}" action="{{action}}" method="{{method || "get"}}" on-submit="envia">{{>content}}</form>',
            onrender: function () {
                forms.mask.form(forms.getCompForm(this));

                this.on('envia', function () {
                    if (this.get('nr-validate')) {
                        if (forms.validate.form(forms.getCompForm(this), this.get('nr-show-error-popup'))) {
                            forms.submit(this);
                        }
                    } else {
                        forms.submit(this);
                    }
                });
            }
        }),
        getBooleanOption = function (text, dft) {
            return text === undefined ? dft : (text === 'false' ? false : (text === 'true' ? true : text));
        };

    Ractive.components['nr:form'] = formWidget;

    this.validate = new Validate($, prompt);
    this.mask = new Mask($);

    this.submit = function (comp) {
        var question = comp.get('nr-question');
        if (question) {
            prompt.question(question, function () {
                forms.send(comp);
            });
        } else {
            forms.send(comp);
        }
    };
    this.getCompForm = function (comp) {
        return $("#" + comp.get('nr-form-id'));
    };
    this.send = function (comp) {
        var callback = comp.get('nr-callback') || false,
            redirect = getBooleanOption(comp.get('nr-redirect'), false),
            reload = getBooleanOption(comp.get('nr-reload'), false),
            contentType = comp.get('nr-content-type') || 'application/x-www-form-urlencoded; charset=UTF-8',
            data = contentType === 'application/json' ? JSON.stringify(comp.get("nr-data")) : this.getCompForm(comp).serialize();

        NR.ajax.run({
            url: comp.get('action'),
            method: comp.get('method') || 'get',
            contentType: contentType,
            data: data,
            success: function (response) {
                if (callback) {
                    NR.modules.call(callback, {
                        data: response
                    });
                }
                if (reload === true) {
                    NR.reload(response);
                } else if (reload) {
                    NR.load(reload, response);
                } else if (redirect === true) {
                    NR.reload();
                } else if (redirect) {
                    NR.load(redirect);
                }
            }
        });
    };
};

/*global module*/
module.exports = Forms;
