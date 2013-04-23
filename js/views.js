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
            this.edges = new app.Edges();

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
                    model: node
                });
            }, this);

            this.appView.edges.on("add", function (edge) {
                var nodeView = new EdgeView({
                    appView: this.appView,
                    model: edge
                });
            }, this);
        },

        draw: function () {
            return this.appView.paper.rect(0, 0, this.width, this.height).attr({
                fill: "white",
                opacity: 0
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

            var animationOptions = {
                opacity: 1
            };

            this.el.animate(animationOptions, 100, 'linear');

            this.eventBindings();
            this.delegateRaphaelEvents();
        },

        draw: function () {
            var nodeR = this.appView.options.nodeR;
            return this.appView.paper.circle(0, 0, nodeR).attr({
                fill: "r(0.25, 0.75)yellow-orange",
                opacity: 0,
                "stroke-opacity": 0.4,
                cx: this.model.get("cx"),
                cy: this.model.get("cy")
            });
        },

        removeTempLine: function () {
            if (this.drag.tempLine && this.drag.tempLine.remove) {
                this.drag.tempLine.remove();
            }
        },

        drag: {
            onMove: function (dx, dy, x, y, event) {
                if (event.altKey) {
                    this.model.set({
                        cx: x,
                        cy: y
                    });
                } else {
                    this.removeTempLine();
                    var cx = this.model.get("cx");
                    var cy = this.model.get("cy");
                    this.drag.tempLine = this.appView.paper.path("M" + cx + "," + cy + "L" + x + "," + y)
                        .toBack().attr({
                        "stroke-dasharray": "-",
                        "stroke-width": 3
                    });
                }
            },
            onEnd: function (event) {
                if (event.altKey) {
                    return;
                }

                if (event.target.tagName === "circle" && event.target !== this.el.node) {
                    _.extend(event.target, Backbone.Events).trigger("app:createEdge", this);
                } else {

                }
                this.removeTempLine();
                setTimeout(_.bind(this.removeTempLine, this), 100);
            }
        },

        eventBindings: function () {
            /* UI binding*/
            this.el.drag(_.throttle(this.drag.onMove, 40), function () {}, this.drag.onEnd, this, this, this);
            _.extend(this.el.node, Backbone.Events).on("app:createEdge", function (from) {
                this.appView.edges.add({
                    from: from.model,
                    to: this.model
                });
            }, this);

            this.on('dblclick', function () {
                this.model.destroy();
            }, this);

            /* Model binding */
            this.model.on("change:cx", function (model, cx) {
                this.el.attr({
                    cx: cx
                });
            }, this);

            this.model.on("change:cy", function (model, cy) {
                this.el.attr({
                    cy: cy
                });
            }, this);

            this.model.on("remove", function () {
                this.el.remove();
            }, this);
        }

    });

    var EdgeView = Backbone.RaphaelElementView.extend({
        initialize: function (options) {
            this.appView = options.appView;
            this.arrow = this.draw();

            this.eventBindings();
        },

        createArrowFromLine: function (line) {
            var nodeR = this.appView.options.nodeR;
            var lineSubpath = line.getSubpath(nodeR, line.getTotalLength() - nodeR);
            line.remove();
            this.appView.paper.setStart();
            line = this.appView.paper.path(lineSubpath);
            var X = line.getPointAtLength(line.getTotalLength());
            var Y = line.getPointAtLength(line.getTotalLength() - Math.min.apply(null, [20, line.getTotalLength()]));
            var norm = {
                x: -(X.y - Y.y) / 2,
                y: (X.x - Y.x) / 2
            };
            var arrowPoints = [{
                x: Y.x + norm.x,
                y: Y.y + norm.y
            }, {
                x: Y.x - norm.x,
                y: Y.y - norm.y
            }];
            _.each(arrowPoints, function (point) {
                this.appView.paper.path("M" + point.x + "," + point.y + "L" + X.x + "," + X.y);
            }, this);
            var arrow = this.appView.paper.setFinish();
            arrow.attr({
                "stroke-width": 3
            });
            return arrow;
        },

        draw: function () {
            var line = this.appView.paper.path(this.model.pathFormat());
            return this.createArrowFromLine(line);
        },

        erase: function () {
            this.arrow.forEach(function (el) {
                el.remove();
            });
        },

        redraw: function () {
            this.erase();
            this.arrow = this.draw();
            this.UIBindings();
        },

        eventBindings: function() {
            this.UIBindings();
            this.ModelBindings();
        },

        UIBindings: function () {
            this.arrow.dblclick(function (e) {
                this.model.destroy();
                this.model.off();
            }, this);
        },

        ModelBindings: function() {
            this.model.on('from:change:cx from:change:cy to:change:cx to:change:cy', _.throttle(this.redraw, 40), this);
            this.model.on('remove', this.erase, this);
        }

    });
}(jQuery, Backbone, _));