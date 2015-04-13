var Prompt = function () {
    'use strict';

    this.question = function (message, callback) {
        /*global confirm*/
        var confirmacao = confirm(message);
        if (confirmacao) {
            callback();
        }
    };
    this.show = function (message) {
        /*global alert*/
        alert(message);
    };
};

/*global module*/
module.exports = Prompt;
