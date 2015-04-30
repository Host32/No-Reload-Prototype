(function (app, QUnit, $) {
    'use strict';
    QUnit.module("Estado composto");

    QUnit.test("estado composto1", function (assert) {
        var done = assert.async();

        app.state("main", {
            el: '#test-space',
            template: '<h3 id="title">Layout</h3><div id="container"></div>'
        });

        app.state("main.principal", {
            el: '#container',
            template: '<div id="resultado">OK</div>',
            onrender: function () {
                assert.equal($('#title').html(), 'Layout', 'layout ok');
                assert.equal($('#resultado').html(), 'OK', 'elemento filho ok');
                done();
            }
        });

        app.go("main.principal");
    });

    QUnit.test("estado composto2", function (assert) {
        var done = assert.async();
        app.state("main", {
            el: '#test-space',
            template: '<h3 id="title">Layout</h3><div id="container"></div>'
        });

        app.state("main.principal", {
            el: '#container',
            template: '<div id="resultado">OK</div>'
        });
        app.state("main.principal2", {
            el: '#container',
            template: '<div id="resultado">OK2</div>',
            onrender: function () {
                assert.equal($('#title').html(), 'Layout', 'layout ok');
                assert.equal($('#resultado').html(), 'OK2', 'elemento filho ok');
                done();
            }
        });

        app.go("main.principal").go("main.principal2");
    });
}(window.app, window.QUnit, window.jQuery));
