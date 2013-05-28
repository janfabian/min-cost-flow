({
    appDir: ".",
    baseUrl: "js",
    dir: "../min-cost-flow-build",
    name: "main",
    paths: {
        'jquery': 'vendor/jquery/jquery',
        'underscore': 'vendor/underscore-amd/underscore',
        'backbone': 'vendor/backbone-amd/backbone',
        'localstorage': 'vendor/backbone.localStorage',
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
})