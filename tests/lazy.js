(function (app, QUnit) {
    'use strict';
    QUnit.module("Lazy");

    QUnit.test("Lazy Injection", function (assert) {
        var done = assert.async();

        app.state("LazyTeste", {
            controller: "LazyDepController"
        });

        app.controller("LazyDepController", ["lazy/dependency.js", function (lazyDep) {
            assert.equal(lazyDep, 'Deu certo!', 'Lazy dep carregada');
            done();
        }]);

        app.go("LazyTeste");
    });


    QUnit.test("Lazy State", function (assert) {
        var done = assert.async();

        app.factory("done", function () {
            return done;
        }).factory("assert", function () {
            return assert;
        });

        app.route("/lazyState", "LazyState", ["lazy/state.js"]);

        app.goToUrl("/lazyState");
    });
}(window.app, window.QUnit));
