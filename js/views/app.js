define([
    'backbone',
    'raphael',
    'collections/nodes',
    'collections/edges',
    'views/layers/layer',
    'views/layers/background',
    'algorithms/ssp'], function (Backbone, Raphael, Nodes, Edges, Layer, BackgroundView, SSP) {
    var App = Backbone.View.extend({

        initialize: function (options) {
            var width = options.width,
                height = options.height;

            /* Private vars */
            this.selected.on('add', function (view) {
                view.attributes.trigger('app:select');
            });

            /* Models and collections init */
            this.nodes = new Nodes();
            this.edges = new Edges();

            /* Children Views */
            this.paper = new Raphael(this.el, width, height);
            this.layerView = new BackgroundView(_.extend({}, options, {
                appView: this
            }));

            this.ssp = new SSP({
                nodes: this.nodes,
                edges: this.edges
            });
        },

        selected: new Backbone.Collection(),

        mincost: function () {
            this.ssp.start();
            _.each(this.nodes.filter(function (node) {
                return node.get('b') > 0 ;
            }), function (node) {
                node.trigger('app:sendStuff');
            });
            this.edges.print();
        },

        clear: function () {
            this.nodes.each(function (n) {
                _.defer(function () {
                    n.destroy();
                });
            });
            this.edges.each(function (e) {
                _.defer(function () {
                    e.destroy();
                });
            });
            this.nodes.reset();
            this.edges.reset();
        },

        clearSelected: function () {
            this.selected.each(function (view) {
                _.defer(_.bind(function () {
                    this.selected.remove(view);
                }, this));
                view.attributes.trigger('app:deselect');
            }, this);
        }

    });
    return App;
});