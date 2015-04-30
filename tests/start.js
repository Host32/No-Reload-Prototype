(function (app, QUnit, $) {
    'use strict';
    QUnit.module("Startup");

    QUnit.test("Startup com injecao do $server e $templateProvider", function (assert) {
        var done = assert.async();

        app.run(function ($server, $templateProvider) {
            assert.equal($server.getServerAddress(), '', 'Server address correto');
            assert.equal($templateProvider.getTemplatePath(), '', 'Template path correto');
            done();
        }).start();
    });

}(window.app, window.QUnit, window.jQuery));
