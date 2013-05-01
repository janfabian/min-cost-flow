define(['jquery', 'underscore', 'views/raphaelElement', 'views/layers/mask', 'views/edit/node', 'utils/view'], function ($, _, RaphaelElement, MaskView, EditNodeView, viewUtils) {
    var NodeView = RaphaelElement.extend({
        initialize: function (options) {
            this.appView = options.appView;
            this.setElement(this.draw());

            var animationOptions = {
                opacity: 1
            };

            this.nodeEditView = new EditNodeView(_.extend({}, this.options, {
                model: this.model
            }));

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
                event = viewUtils.normalize(event);
                if (event.altKey && this.drag.startWithAlt) {
                    if (this.isInAnotherCircle(event.target)) {
                        return;
                    }
                    this.model.set({
                        cx: event.position.x,
                        cy: event.position.y
                    });
                } else {
                    this.removeTempLine();
                    var cx = this.model.get("cx");
                    var cy = this.model.get("cy");
                    this.drag.tempLine = this.appView.paper.path("M" + cx + "," + cy + "L" + event.position.x + "," + event.position.y)
                        .toBack().attr({
                        "stroke-dasharray": "-",
                        "stroke-width": 3
                    });
                }
                this.drag.removeEditWindowOnce();
            },
            onStart: function (x, y, event) {
                this.drag.startWithAlt = false;
                if (event.altKey) {
                    this.drag.startWithAlt = true;
                    this.el.insertAfter(this.appView.layerView.el);
                }
                this.drag.removeEditWindowOnce = _.once(_.bind(this.nodeEditView.remove, this.nodeEditView));
            },
            onEnd: function (event) {
                if (event.altKey && this.drag.startWithAlt) {
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

        DOMBindings: function () {
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
        },

        ViewBindings: function () {
            this.on('dblclick', function () {
                this.model.destroy();
                this.stopListening(this.model);
            }, this);

            this.on('mousedown', function (e) {
                this.appView.clearSelected();
                if (!e.altKey) {
                    this.appView.selected.add(this);
                }
            }, this);

            this.on("mouseover", function () {
                this.el.attr({
                    "stroke-width": "4"
                });
            }, this);

            this.on("mouseout", function () {
                this.el.attr({
                    "stroke-width": "1"
                });
            }, this);

            this.on("app:select", function () {
                this.nodeEditView.render({
                    x: this.model.get('cx') + 20,
                    y: this.model.get('cy')
                });
            }, this);

            this.on("app:deselect", function () {
                this.nodeEditView.remove();
            }, this);
        },

        ModelBindings: function () {
            this.listenTo(this.model, "change:cx change:cy", function (model, cx) {
                this.el.attr({
                    cx: this.model.get('cx'),
                    cy: this.model.get('cy')
                });
            }, this);

            this.listenTo(this.model, "destroy", function () {
                this.el.remove();
                this.nodeEditView.remove();
            }, this);
        }

    });
    return NodeView;
});