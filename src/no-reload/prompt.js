var Prompt = function () {
    'use strict';

    this.question = function (message, callback) {
        /*global confirm*/
        var confirmacao = confirm(message);
        if (confirmacao) {
            callback();
        }
    };
    this.prompt = function (message) {
        /*global alert*/
        alert(message);
    };
};
