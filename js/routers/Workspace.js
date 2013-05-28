define([
    'jquery',
    'backbone',
    'views/modal',
    'data/examples',
    'text!templates/algorithms/min-cost.html',
    'views/tutorial'], function ($, Backbone, ModalView, examples, mincostTpl, Tutorial) {
    var Workspace = Backbone.Router.extend({

        initialize: function (app) {
            this.app = app;
            this.tutorial = new Tutorial(app, this);
            this.on('all', this.storeRoute, this);
            this.history = [];
        },

        storeRoute: function () {
            this.history.push(Backbone.history.fragment);
        },

        previous: function () {
            if (this.history.length > 1) {
                this.navigate(this.history[this.history.length - 2], {
                    trigger: false
                });
            } else {
                this.navigate('', {
                    trigger: false
                });
            }
        },

        routes: {
            "": "home",
            "help": "help", // #help
            "example/:id": "example",
            "save": "save",
            "load": "load",
            "tutorial/:step": "tutorial",
            "algorithms/:alg": "algorithms"
        },

        home: function () {
            this.modalView && this.modalView.remove();
        },

        save: function () {
            localStorage.setItem('data', JSON.stringify({
                edges: this.app.edges.map(function (edge) {
                    return edge.savingData();
                }),
                nodes: this.app.nodes.map(function (node) {
                    return node.savingData();
                })
            }));
            this.previous();
        },

        load: function () {
            var data;
            this.app.clear();
            if (data = localStorage.getItem('data')) {
                this.loadData(JSON.parse(data));
            }
            this.previous();
        },

        help: function () {
            this.modalView = new ModalView();
            this.modalView.render();
            this.modalView.once('closed', _.bind(function () {
                this.navigate('');
            }, this));

        },

        loadData: function (data) {
            _.each(data.nodes, function (n) {
                this.app.nodes.add(n);
            });
            _.each(data.edges, function (e) {
                this.app.edges.add(_.extend({}, e, {
                    from: this.app.nodes.at(e.from),
                    to: this.app.nodes.at(e.to)
                }));
            });
        },

        example: function (id) {
            if (id < 1 || id > 3) {
                return;
            }
            this.app.clear();
            this.loadData(examples[id - 1]);
        },

        tutorial: function (step) {
            if (step < 1 || step > 10) {
                return;
            }
            this.tutorial.createStep(step);
        },

        algorithms: function (name) {
            switch (name) {
                case "mcf":
                    $('#mcfp').off('click');
                    $('#text article').html(_.template(mincostTpl)());
                    $('#mcfp').on('click', _.bind(function () {
                        this.app.mincost();
                    }, this));
                    break;
            }
        }

    });
    return Workspace;
});