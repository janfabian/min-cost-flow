(function ($, Backbone, _) {
    var app = window.app;

    var raphaelEvents = ["mouseup", "mousedown", "mousemove", "mouseover",
        "mouseout", "click", "dblclick", "touchcancel",
        "touchend", "touchmove", "touchstart"];

    Backbone.View = Backbone.View.extend({
        // bind draw function to this object
        bindDraw: function () {
            _.each(this.draw, function (fn, name) {
                this.draw[name] = _.bind(fn, this);
            }, this);
        }
    });

    Backbone.RaphaelView = Backbone.View.extend({

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

    Backbone.RaphaelElementView = Backbone.View.extend({

        delegateRaphaelEvents: function () {
            _.each(raphaelEvents, function (eventName) {
                this.el[eventName](_.bind(function (e) {
                    this.trigger(e.type, e);
                }, this));
            }, this);
        }

    });

    var AppView = app.AppView = Backbone.RaphaelView.extend({

        initialize: function (options) {
            var width = options.width,
                height = options.height;

            /* Models and collections init */
            this.nodes = new app.Nodes();

            /* Children Views */
            this.paper = new Raphael(this.el, width, height);
            var layerView = new LayerView(_.extend({}, options, {
                appView: this
            }));
        }

    });

    var LayerView = app.LayerView = Backbone.RaphaelElementView.extend({
        initialize: function (options) {
            this.width = options.width;
            this.height = options.height;
            this.appView = options.appView;
            this.setElement(this.draw());

            this.eventBindings();
            this.delegateRaphaelEvents();
        },

        eventBindings: function () {
            /* UI events*/
            this.on("click", this.createNode, this);

            /* Model events*/
            this.appView.nodes.on("add", function (node) {
                var nodeView = new NodeView({
                    appView: this.appView,
                    model: node,
                    cx: node.get("cx"),
                    cy: node.get("cy")
                });
            }, this);
        },

        draw: function () {
            return this.appView.paper.rect(0, 0, this.width, this.height).attr({
                fill: "white"
            });
        },

        createNode: function (e) {
            e = $.event.fix(e);
            this.appView.nodes.add([{
                cx: e.offsetX,
                cy: e.offsetY
            }]);
        }
    });

    var NodeView = Backbone.RaphaelElementView.extend({
        initialize: function (options) {
            this.appView = options.appView;
            this.setElement(this.draw());

            _.defaults(options, {
                cx: 0,
                cy: 0
            });
            var animationOptions = {
                opacity: 1
            }
            this.el.attr(options);
            this.el.animate(animationOptions, 100, 'linear');

            this.eventBindings();
            this.delegateRaphaelEvents();
        },

        draw: function () {
            return this.appView.paper.circle(100, 100, 20).attr({
                fill: "r(0.25, 0.75)yellow-orange",
                opacity: 0,
                "stroke-opacity": .4
            });
        },

        eventBindings: function () {
            var that = this;
            /* UI binding*/
            this.el.drag(function (dx, dy, x, y, event) {
                if (event.altKey) {
                    that.model.set({
                        cx: x,
                        cy: y
                    });
                }
            }, function () {}, function (event) {
                if (event.target.tagName === "circle" && event.target !== this.node) {
                    console.log("create line");
                }
            });

            /* Model binding */
            this.model.on("change:cx", function (model, cx) {
                this.el.attr({
                    cx: cx
                });
            }, this)

            this.model.on("change:cy", function (model, cy) {
                this.el.attr({
                    cy: cy
                });
            }, this)
        }

    });
}(jQuery, Backbone, _));