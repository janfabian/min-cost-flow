require.config({
    paths: {
        'jquery': 'vendor/jquery/jquery',
        'underscore': 'vendor/underscore-amd/underscore',
        'backbone': 'vendor/backbone-amd/backbone',
        'raphael': 'vendor/raphael/raphael',
        'eve': 'vendor/eve/eve'
    },
    shim: {
        'raphael': {
            deps: ['eve'],
            exports: "Raphael"
        }
    }
});

require(['views/app', 'jquery'], function (AppView, $) {
    $(document).ready(function () {
        var config = {
            el: $("#canvas-container"),
            width: 1000,
            height: 1000,
            nodeR: 20
        };

        new AppView(config);
    });
});