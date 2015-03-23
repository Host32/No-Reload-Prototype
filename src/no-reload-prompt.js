(function (NR, $) {
    NR.prompt = (function () {
        return {
            show: function (message) {
                $('body').append(
                    $('<DIV>')
                    .append('<p>teste</p>')
                    .dialog({
                        modal: true,
                        buttons: {
                            Ok: function () {
                                dialog.dialog("close");
                            }
                        },
                        close: function () {
                            $(this).remove();
                        }
                    })
                );
            },
            showQuestion: function (question, callback) {
                $('body').append(
                    $('<DIV>')
                    .append('<p>' + question + '</p>')
                    .dialog({
                        modal: true,
                        buttons: {
                            Sim: function () {
                                callback();
                                $(this).dialog("close");
                            },
                            Não: function () {
                                dialog.dialog("close");
                            }
                        },
                        close: function () {
                            $(this).remove();
                        }
                    })
                );
            }
        };
    })();
})(NoReload, jQuery);