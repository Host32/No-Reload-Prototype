(function (NR) {
    $(document).on('keyup', '[nr-bind]', function () {
        var modelName = $(this).attr('nr-bind');
        NR.setControllerValue(modelName, $(this).val());
    });
    $(document).on('change', '[nr-bind]', function () {
        var modelName = $(this).attr('nr-bind');
        NR.setControllerValue(modelName, $(this).val());
    });

    $(document).on('click', '[nr-click]', function (e) {
        var modelName = $(this).attr('nr-click');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
    $(document).on('dblclick', '[nr-dblclick]', function (e) {
        var modelName = $(this).attr('nr-dblclick');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
    $(document).on('change', '[nr-change]', function (e) {
        var modelName = $(this).attr('nr-change');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
    $(document).on('focus', '[nr-focus]', function (e) {
        var modelName = $(this).attr('nr-focus');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
    $(document).on('keyup', '[nr-keyup]', function (e) {
        var modelName = $(this).attr('nr-keyup');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
    $(document).on('keydown', '[nr-keydown]', function (e) {
        var modelName = $(this).attr('nr-keydown');
        NR.callControllers(modelName, {
            element: this,
            event: e
        });
    });
})(NoReload);