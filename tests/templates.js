'use strict';
QUnit.module("Templates");
QUnit.test("Ajax route with string template", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'template',
        path: 'content.json',
        template: 'template'
    });

    setTimeout(function () {
        var message = $('#test-space #original').html();
        $('#test-space #original').html("");

        assert.equal(message, 'ok', 'template compilado');
        done();
    }, 100);

    NR.load('template');
});

QUnit.test("Ajax route with string template with model", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'template2',
        path: 'content.json',
        template: 'template',
        model: function (data) {
            this.id = data.id;
            this.message = data.message;
        }
    });

    setTimeout(function () {
        var message = $('#test-space #original').html();
        $('#test-space #original').html("");

        assert.equal(message, 'ok', 'template compilado');
        done();
    }, 100);

    NR.load('template2');
});

QUnit.test("Ajax route with object template", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'template3',
        path: 'content.json',
        template: {
            url: 'template'
        }
    });

    setTimeout(function () {
        var message = $('#test-space #original').html();
        $('#test-space #original').html("");

        assert.equal(message, 'ok', 'template compilado');
        done();
    }, 100);

    NR.load('template3');
});

QUnit.test("Ajax route with Object template with model", function (assert) {
    'use strict';
    var done = assert.async();
    NR.routes.register({
        alias: 'template4',
        path: 'content.json',
        template: {
            url: 'template'
        },
        model: function (data) {
            this.id = data.id;
            this.message = data.message;
        }
    });

    setTimeout(function () {
        var message = $('#test-space #original').html();
        $('#test-space #original').html("");

        assert.equal(message, 'ok', 'template compilado');
        done();
    }, 100);

    NR.load('template4');
});


QUnit.test("Ajax route with Object template with model with controller", function (assert) {
    'use strict';
    var done = assert.async(),
        controllerDataOk = false,
        controllerTemplateOk = false;
    NR.routes.register({
        alias: 'template5',
        path: 'content.json',
        template: {
            url: 'template'
        },
        model: function (data) {
            this.id = data.id;
            this.message = data.message;
        },
        controller: function (params) {
            controllerDataOk = params.data.message === 'ok';
            controllerTemplateOk = params.template.get('message') === 'ok';
        }
    });

    setTimeout(function () {
        var message = $('#test-space #original').html();
        $('#test-space #original').html("");

        assert.ok(controllerDataOk, 'controller data ok');
        assert.ok(controllerTemplateOk, 'controller template ok');
        assert.equal(message, 'ok', 'template compilado');
        done();
    }, 100);

    NR.load('template5');
});
