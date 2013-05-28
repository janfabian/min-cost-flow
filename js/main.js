require.config({
    paths: {
        'jquery': 'vendor/jquery/jquery',
        'underscore': 'vendor/underscore-amd/underscore',
        'backbone': 'vendor/backbone-amd/backbone',
        'localStorage': 'vendor/backbone.localStorage',
        'raphael': 'vendor/raphael/raphael',
        'eve': 'vendor/eve/eve',
        'async': 'vendor/async/lib',
        'text': 'vendor/requirejs-text/text'
    },
    shim: {
        
        'raphael': {
            deps: ['eve'],
            exports: "Raphael"
        }
    }
});

require([
    'views/app',
    'routers/Workspace',
    'jquery', 
    'backbone'], function (AppView, Workspace, $, Backbone) {
    $(document).ready(function () {
        var config = {
            el: $("#canvas-container"),
            width: 1000,
            height: 500,
            nodeR: 20
        };

        var app = window.app = new AppView(config);

        new Workspace(app);
        Backbone.history.start();
    });
});