define(['backbone', 'raphael', 'collections/nodes', 'collections/edges', 'views/layer'], function (Backbone, Raphael, Nodes, Edges, LayerView) {
    var App = Backbone.View.extend({

        initialize: function (options) {
            var width = options.width,
                height = options.height;

            /* Models and collections init */
            this.nodes = new Nodes();
            this.edges = new Edges();
            
            /* Children Views */
            this.paper = new Raphael(this.el, width, height);
            this.layerView = new LayerView(_.extend({}, options, {
                appView: this
            }));

            this.nodes.add([{
                cx: 100,
                cy: 100
            }, {
                cx: 200,
                cy: 200
            }, {
                cx: 200,
                cy: 100
            }, {
                cx: 100,
                cy: 200
            }]);
        },

        delegateRaphaelEvents: function (views) {
            var that = this;
            var viewRaphaelEvents = function (view, name) {
                _.each(raphaelEvents, function (eventName) {
                    view.el[eventName](function (e) {
                        that.trigger("raphael:" + name + ":" + e.type, e);
                    });
                });
            };
            _.each(views, viewRaphaelEvents);
        }
    });
    return App;
});