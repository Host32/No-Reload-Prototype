(function (app, QUnit) {
    'use strict';
    QUnit.module("Controllers");

    QUnit.test("Template statico", function (assert) {
        var done = assert.async();

        app.factory("teste", function ($ajax, $template) {
            assert.equal($ajax.getServerAddress(), '', 'Server address correto');
            assert.equal($template.getTemplatePath(), '', 'Template path correto');
            return {
                ok: 'testeOk'
            };
        });
        app.factory("testeInjecao", function (teste) {
            assert.equal(teste.ok, 'testeOk', 'Teste ok');
            return {
                ok: teste.ok + ', testeInjecaoOk'
            };
        });

        app.state("home", {
            el: '#test-space',
            template: '{{bar}}',
            controller: "Home"
        });

        app.controller("Home", function (testeInjecao) {
            this.set('bar', testeInjecao.ok);
            assert.equal(testeInjecao.ok, 'testeOk, testeInjecaoOk', 'TesteInjecao ok');
            done();
        });

        app.go("home");
    });


    QUnit.test("Template Dinamico", function (assert) {
        var done = assert.async();

        app.state("home2", {
            el: '#test-space',
            templateUrl: 'resources/template.ract',
            controller: "Home2"
        });

        app.controller("Home2", function () {
            this.set("foo.bar", 'ok');
            assert.equal(true, true, 'TesteInjecao ok');
            done();
        });

        app.go("home2");
    });

    QUnit.test("Server Request", function (assert) {
        var done = assert.async();

        app.state("home3", {
            el: '#test-space',
            templateUrl: 'resources/template.ract',
            serverLink: 'resources/content.json',
            controller: "Home3"
        });

        app.controller("Home3", function ($serverResponse) {
            this.set($serverResponse);
            assert.equal($serverResponse.ok, true, 'Resposta do servidor ok');
            done();
        });

        app.go("home3");
    });
}(window.app, window.QUnit));
