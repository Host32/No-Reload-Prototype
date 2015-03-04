(function(NR) {
    NR.intervals = (function() {
        var intervals = {};

        var __export__ = {
            register: function(name, func, time, cleanable) {
                cleanable = NR.utils.defaultValue(cleanable, true);
                intervals[name] = {
                    interval: setInterval(func, time),
                    cleanable: cleanable
                };
            },
            clear: function(name) {
                if (typeof intervals[name] !== 'undefined')
                    clearInterval(intervals[name].interval);
            },
            clearAll: function() {
                for (var key in intervals) {
                    if (intervals[key].cleanable)
                        clearInterval(intervals[key].interval);
                }
            }
        };

        NR.registerPreLoadEvent("clearAllIntervals", __export__.clearAll);

        return __export__;
    })();
})(NoReload);
