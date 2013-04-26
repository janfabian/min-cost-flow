define(['jquery', 'views/raphaelElement'], function ($, RaphaelElement) {
    var NodeView = RaphaelElement.extend({
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
                this.appView.edges.add({
                    from: from,
                    to: this.model                    
                });
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
    return NodeView;
});