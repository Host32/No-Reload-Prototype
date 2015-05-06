(function (app, QUnit, $) {
    'use strict';
    QUnit.module("URL");

    QUnit.test("Simple Url Test", function (assert) {
        var done = assert.async();

        app.state("URLTest", {
            el: '#test-space',
            template: 'URL OK',
            controller: "URLTest"
        });

        app.controller("URLTest", function () {
            this.onrender = function () {
                assert.equal($('#test-space').html(), 'URL OK', 'acessado pela url ok');
                done();
            };
        });

        app.route("/URlTest", "URLTest");

        app.goToUrl("/URlTest");
    });
}(window.app, window.QUnit, window.jQuery));
