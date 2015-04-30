(function (app, QUnit, $) {
    'use strict';
    QUnit.module("Components");

    QUnit.test("Componente estatico", function (assert) {
        var done = assert.async();

        app.component("StaticComponent", {
            template: '<div id="componente-field">OK</div>'
        });

        app.state("staticComponent", {
            el: '#test-space',
            template: '<componente>',
            components: {
                componente: "StaticComponent"
            },
            onrender: function () {
                assert.equal($('#componente-field').html(), 'OK', 'Compilacao ok');
                done();
            }
        });

        app.go("staticComponent");
    });

    QUnit.test("componente carregado", function (assert) {
        var done = assert.async();

        app.component('MyComponent', {
            templateUrl: 'resources/component.ract'
        });
        app.state("lazyComponent", {
            el: '#test-space',
            template: '<div id="componente-field"><componente></div>',
            components: {
                componente: "MyComponent"
            },
            onrender: function () {
                assert.equal($('#componente-field').html(), 'COMPONENTE', 'Compilacao ok');
                done();
            }
        });

        app.go("lazyComponent");
    });

    QUnit.test("componente Global", function (assert) {
        var done = assert.async();

        app.component('ComponenteGlobal', {
            template: 'CGlobal',
            global: true
        });

        app.state("globalComponent", {
            el: '#test-space',
            template: '<div id="componente-field"><ComponenteGlobal></div>',
            onrender: function () {
                assert.equal($('#componente-field').html(), 'CGlobal', 'Compilacao ok');
                done();
            }
        });
        app.go("globalComponent");
    });

}(window.app, window.QUnit, window.jQuery));
