(function (app) {
    'use strict';

    app.controller("LazyController", function (assert, done) {
        assert.equal(true, true, 'Lazy controller carregado');
        done();
    });
}(window.app));
