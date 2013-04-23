(function ($, Backbone, _) {

    var app = window.app = {};

    $(document).ready(function () {
        var config = {
            el: $("#canvas-container"),
            width: 500,
            height: 500,
            nodeR: 20
        };

        new app.AppView(config);
    });


}(jQuery, Backbone, _));