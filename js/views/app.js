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

            this.nodes.add([{
                cx: 100,
                cy: 200,
                b: 4
            }, {
                cx: 300,
                cy: 100
            }, {
                cx: 300,
                cy: 300
            }, {
                cx: 500,
                cy: 200,
                b: -4
            }]);
            this.edges.add([{
                from: this.nodes.at(0),
                to: this.nodes.at(1),
                C: 2,
                U: 0,
                L: 0
            }, {
                from: this.nodes.at(0),
                to: this.nodes.at(2),
                C: 2,
                U: 2
            }, {
                from: this.nodes.at(1),
                to: this.nodes.at(2),
                C: 1,
                U: 2
            }, {
                from: this.nodes.at(1),
                to: this.nodes.at(3),
                C: 3,
                U: 3
            }, {
                from: this.nodes.at(2),
                to: this.nodes.at(3),
                C: 1,
                U: 5
            }]);

            var ssp = window.ssp = new SSP({
                nodes: this.nodes,
                edges: this.edges,
                start: this.nodes.at(0)
            });

            window.mincost = function() {
                ssp.start();
                _.each(app.nodes.filter(function(node){
                    return node.get('b') > 0;
                }), function(node) {
                    node.trigger('app:sendStuff');
                });
                app.edges.print();
            };
        },

        selected: new Backbone.Collection(),

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