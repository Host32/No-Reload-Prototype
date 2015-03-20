(function (NR) {
    NR.timeouts = (function () {
        var timeouts = {};

        var __export__ = {
            register: function (name, func, time, cleanable) {
                if (typeof cleanable === 'undefined')
                    cleanable = true;

                timeouts[name] = {
                    timeout: setTimeout(func, time),
                    cleanable: cleanable
                };
            },
            clear: function (name) {
                if (typeof timeouts[name] !== 'undefined')
                    clearTimeout(timeouts[name].timeout);
            },
            clearAll: function () {
                for (var key in timeouts) {
                    if (timeouts[key].cleanable)
                        clearTimeout(timeouts[key].timeout);
                }
            }
        };

        NR.registerBeforeLoadEvent("clearAllTimeouts", __export__.clearAll);

        return __export__;
    })();
})(NoReload);