(function (app, QUnit) {
    'use strict';
    QUnit.module("Startup");

    QUnit.test("Startup com injecao do $ajax e $template", function (assert) {
        var done = assert.async();

        app.startup(function ($ajax, $template) {
            assert.equal($ajax.getServerAddress(), '', 'Server address correto');
            assert.equal($template.getTemplatePath(), '', 'Template path correto');
            done();
        }).startAnchorNavigation();
    });
}(window.app, window.QUnit));
