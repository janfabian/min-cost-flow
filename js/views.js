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
        },

        eventBindings: function () {
            this.NodeBinding();
            this.ViewBindings();
            this.ModelBindings();
        },

        NodeBinding: function() {},
        ViewBindings: function () {},
        ModelBindings: function () {}

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

        ViewBindings: function () {
            this.on("click", this.createNode, this);
        },

        ModelBindings: function () {
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
                cx: e.clientX,
                cy: e.clientY
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

        isInAnotherCircle: function (element) {
            return element.tagName === "circle" && element !== this.el.node;
        },

        drag: {
            onMove: function (dx, dy, x, y, event) {
                if (event.altKey) {
                    if (this.isInAnotherCircle(event.target)) {
                        return;
                    }
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
            onStart: function (x, y, event) {
                this.el.insertAfter(this.appView.layerView.el);
            },
            onEnd: function (event) {
                if (event.altKey) {
                    return;
                }

                if (event.target !== this.el.node) {
                    _.extend(event.target, Backbone.Events).trigger("app:createEdge", {
                        from: this.model,
                        event: event
                    });
                }

                this.removeTempLine();
                setTimeout(_.bind(this.removeTempLine, this), 100);
            }
        },

        ViewBindings: function () {
            this.el.drag(_.throttle(this.drag.onMove, 40), this.drag.onStart, this.drag.onEnd, this, this, this);
            _.extend(this.el.node, Backbone.Events).on("app:createEdge", function (params) {
                var from = params.from;
                if (_.isEqual(from, this.model)) {
                    return;
                }
                if (this.model.existEdgeFrom(from)) {
                    return;
                }
                var edge = new app.Edge({
                    from: from,
                    to: this.model
                });
                this.appView.edges.add(edge);
            }, this);

            this.on('dblclick', function () {
                this.model.destroy();
                this.stopListening(this.model);
            }, this);
            this.on("mouseover", _.bind(function () {
                this.el.attr({
                    "stroke-width": "4"
                });
            }, this));
            this.on("mouseout", _.bind(function () {
                this.el.attr({
                    "stroke-width": "1"
                });
            }, this));
        },

        ModelBindings: function () {
            this.listenTo(this.model, "change:cx", function (model, cx) {
                this.el.attr({
                    cx: cx
                });
            }, this);

            this.listenTo(this.model, "change:cy", function (model, cy) {
                this.el.attr({
                    cy: cy
                });
            }, this);

            this.listenTo(this.model, "destroy", function () {
                this.el.remove();
            }, this);
        }

    });

    var EdgeView = Backbone.RaphaelElementView.extend({
        initialize: function (options) {
            this.appView = options.appView;
            this.setElement(this.draw());

            this.eventBindings();
            this.delegateRaphaelEvents();
        },
        attrs: {
            "stroke-width": 3
        },

        draw: function () {
            var nodeR = this.appView.options.nodeR,
                line = this.appView.paper.path(this.model.pathFormat()),
                lineSubpath = line.getSubpath(nodeR, line.getTotalLength() - nodeR);
            if (line.getTotalLength() < 3 * nodeR) {
                // sending the short line to the back will prevent adding arrow on
                // hover
                return line.toBack().attr(this.attrs);
            } else {
                line.remove();
                return this.appView.paper.path(lineSubpath).attr(_.defaults({}, this.attrs, {
                    "arrow-end": "classic-wide-long"
                }));
            }
        },

        erase: function () {
            this.el.remove && this.el.remove();
        },

        redraw: function () {
            this.erase();

            this.setElement(this.draw());
            this.NodeBinding();
            this.delegateRaphaelEvents();
        },

        NodeBinding: function () {
            _.extend(this.el.node, Backbone.Events).on("app:createEdge", function (params) {
                var e = $.event.fix(params.event);
                var from = this.model.get('from'),
                    to = this.model.get('to');

                this.model.destroy();
                this.stopListening(this.model);
                this.appView.nodes.once('add', function (node) {
                    this.appView.edges.add({
                        from: params.from,
                        to: node
                    });
                    this.appView.edges.add({
                        from: from,
                        to: node
                    });
                    this.appView.edges.add({
                        from: node,
                        to: to
                    });
                }, this);

                this.appView.layerView.createNode(e);
            }, this);
        },

        ViewBindings: function () {
            this.on("dblclick", function (e) {
                this.model.destroy();
                this.stopListening(this.model);
            }, this);

            this.on("click", function (e) {

            }, this);

            this.on("mouseover", _.bind(function () {
                this.el.attr({
                    "stroke-width": "9",
                    "arrow-end": "classic-narrow-short"
                });
            }, this));

            this.on("mouseout", _.bind(function () {
                this.el.attr(_.defaults({}, this.attrs, {
                    "stroke-dasharray": "",
                    "arrow-end": "classic-wide-long"
                }));
            }, this));
        },

        ModelBindings: function () {
            this.listenTo(this.model, 'from:change:cx from:change:cy to:change:cx to:change:cy', _.throttle(this.redraw, 40), this);
            this.listenTo(this.model, 'destroy', this.erase, this);
        }

    });
}(jQuery, Backbone, _));