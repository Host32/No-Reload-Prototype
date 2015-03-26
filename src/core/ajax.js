module.exports = function ($) {
    this.getDefaultParams = function (url) {
        var ajax = this;
        return {
            dataType: "json",
            beforeSend: ajax.beforeSend,
            complete: ajax.complete,
            error: ajax.error,
            cache: false
        };
    };
    this.prepareUrl = function (location) {
        return window.NoReload.getServerAddress() + location;
    };
    this.error = function () {
        throw "Ajax Error";
    };
    this.beforeSend = function () {};
    this.complete = function () {};
    this.run = function (params) {
        var url = params.url || '';
        params.url = this.prepareUrl(url);

        params = $.extend({}, this.getDefaultParams(url), params);

        $.ajax(params);
    };
};