(function (app, QUnit, $) {
    'use strict';
    QUnit.module("Partials");

    QUnit.test("partial statica", function (assert) {
        var done = assert.async();

        app.state("staticPartial", {
            el: '#test-space',
            template: 'isso: <div id="partial-field">{{>myPartial}}</div>',
            partials: {
                myPartial: 'OK'
            },
            onrender: function () {
                assert.equal($('#partial-field').html(), 'OK', 'Compilacao ok');
                done();
            }
        });

        app.go("staticPartial");
    });

    QUnit.test("partial carregada", function (assert) {
        var done = assert.async();

        app.partial('MyPartial', {
            templateUrl: 'resources/partial.ract'
        });

        app.state("lazyPartial", {
            el: '#test-space',
            template: 'isso: <div id="partial-field">{{>myPartial}}</div>',
            partials: {
                myPartial: 'MyPartial'
            },
            onrender: function () {
                assert.equal($('#partial-field').html(), 'Partial Dinamica', 'Compilacao ok');
                done();
            }
        });

        app.go("lazyPartial");
    });

    QUnit.test("partial Global", function (assert) {
        var done = assert.async();

        app.partial('GlobalPartial', {
            template: 'Global',
            global: true
        });

        app.state("globalPartial", {
            el: '#test-space',
            template: 'isso: <div id="partial-field">{{>GlobalPartial}}</div>',
            onrender: function () {
                assert.equal($('#partial-field').html(), 'Global', 'Compilacao ok');
                done();
            }
        });

        app.go("globalPartial");
    });
}(window.app, window.QUnit, window.jQuery));
