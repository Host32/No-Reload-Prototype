var Forms = function ($, NR, Ractive, prompt) {
    'use strict';
    var forms = this,

        formWidget = Ractive.extend({
            template: '<form id="{{this["nr-form-id"]}}" class="nr-form {{class}}" action="{{action}}" method="{{method || "get"}}" on-submit="envia">{{>content}}</form>',
            onrender: function () {

                this.on('envia', function () {
                    forms.submit(this);
                });
            }
        });

    Ractive.components['nr:form'] = formWidget;

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
            redirect = comp.get('nr-redirect') || false,
            contentType = comp.get('nr-content-type') || 'application/x-www-form-urlencoded; charset=UTF-8',
            data = contentType === 'application/json' ? JSON.stringify(comp.get("nr-data")) : this.getCompForm(comp).serialize();

        NR.ajax.run({
            url: comp.get('action'),
            method: comp.get('method') || 'get',
            contentType: contentType,
            data: data,
            success: function (response) {
                if (callback) {
                    NR.modules.call(callback, response);
                }
                if (redirect === true || redirect === 'true') {
                    NR.reload(response);
                } else if (redirect) {
                    NR.load(redirect, response);
                }
            }
        });
    };
};

/*global module*/
module.exports = Forms;
