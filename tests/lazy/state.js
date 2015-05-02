(function (app) {
    'use strict';

    app.state("LazyState", {
        controller: "LazyController",
        controllerPath: "lazy/controller.js"
    });
}(window.app));
