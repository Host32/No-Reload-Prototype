module.exports = function (NR, $) {

    this.getDefaultParams = function (url) {
        var ajax = this;
        return {
            contentType: "application/json",
            dataType: "json",
            beforeSend: ajax.beforeSend,
            complete: ajax.complete,
            error: ajax.error,
            cache: false
        };
    };
    this.prepareUrl = function (location) {
        return NR.getServerAddress() + location;
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