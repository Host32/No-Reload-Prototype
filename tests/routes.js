QUnit.module("Routes");
QUnit.test("Static route with controller without alias", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        path: 'teste1',
        type: 'static',
        controller: function () {
            assert.ok(true, 'controller chamado');
            done();
        }
    });

    NR.load('teste1');
});

QUnit.test("Static route with controller with alias", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'teste2alias',
        path: 'teste2',
        type: 'static',
        controller: function () {
            assert.ok(true, 'controller chamado');
            done();
        }
    });

    NR.load('teste2alias');
});

QUnit.test("Static route with controller with pathParam", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'pathParam/:id',
        path: 'pathParam/:id',
        type: 'static',
        controller: function (response) {
            assert.equal(response.route.matches.id, 'ok', 'Path param');
            done();
        }
    });

    NR.load('pathParam/ok');
});

QUnit.test("Ajax route with controller", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'controller/ajax',
        path: 'content.json',
        controller: function (response) {
            assert.ok(response.data.ok, 'Server response');
            done();
        }
    });

    NR.load('controller/ajax');
});

QUnit.test("Ajax route with controller with pathParam", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'controller/path/:id/:outro/:opt?',
        path: 'content.json?id=:id&outro=:outro&opt=:opt',
        controller: function (response) {
            assert.ok(response.data.ok, 'Server response');
            assert.equal(response.route.matches.id, 'id', 'Path param obrigatorio 1');
            assert.equal(response.route.matches.outro, 'outro', 'Path param obrigatorio 2');
            assert.equal(response.route.matches.opt, undefined, 'Path param opcional');
            done();
        }
    });

    NR.load('controller/path/id/outro');
});
