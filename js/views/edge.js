define(['jquery', 'underscore', 'raphael', 'views/raphaelElement', 'views/edit/edge', 'utils/view'], function ($, _, Raphael, RaphaelElement, EditEdgeView, viewUtils) {
    var EdgeView = RaphaelElement.extend({
        initialize: function (options) {
            this.appView = options.appView;

            this.setElement(this.draw());
            this.label = this.drawInfo();

            this.edgeEditView = new EditEdgeView(_.extend({}, this.options, {
                model: this.model
            }));

            this.eventBindings();
            this.delegateRaphaelEvents();
            this.delegateRaphaelEvents(this.label);
        },

        attrs: {
            "stroke-width": 3
        },

        direction: function (options) {
            options = options || {};
            var vector;
            if (options.line) {
                var line = this.getLine(),
                    start = line.getPointAtLength(0),
                    end = line.getPointAtLength(line.getTotalLength());
                vector = {
                    x: end.x - start.x,
                    y: start.y - end.y
                };
            } else {
                vector = {
                    x: this.model.get('to').get('cx') - this.model.get('from').get('cx'),
                    // point [0,0] is upper left corner
                    y: this.model.get('from').get('cy') - this.model.get('to').get('cy')
                };
            }
            return options.normalize ? viewUtils.normalizeVector(vector) : vector;
        },

        pathFormat: function () {
            var model = this.model;
            return "M" + model.get("from").get("cx") + "," + model.get("from").get("cy") +
                "L" + model.get("to").get("cx") + "," + model.get("to").get("cy");
        },

        infoFormat: function () {
            var model = this.model;
            return "C: " + this.model.get('C') + ", L: " + this.model.get('L') +
                " U: " + this.model.get('U');
        },

        transformLine: function () {
            var dir = this.direction(),
                lineDir = this.direction({
                    line: true
                }),
                lengthRatio = viewUtils.length(dir) / (viewUtils.length(lineDir) + 40),
                angleDif = -Math.atan2(lineDir.x, lineDir.y) + Math.atan2(dir.x, dir.y),
                centerS = {
                    x: this.model.get('to').get('cx') - 20 * viewUtils.normalizeVector(lineDir).x,
                    y: this.model.get('to').get('cy') - 20 * viewUtils.normalizeVector(lineDir).y
                },
                trans =
                    "r" + (angleDif * 180 / Math.PI) + "," + this.model.get('to').get('cx') + "," + this.model.get('to').get('cy') +
                    "s" + lengthRatio + "," + lengthRatio + "," + centerS.x + "," + centerS.y;
            this.getLine().transform(trans);
        },

        transformInfo: function (text) {
            text = text || this.label;
            var middle = this.getMiddle();
            var dir = this.direction({
                normalize: true
            });
            var trans = "r" + (-90 + Math.atan2(dir.x, dir.y) * 180 / Math.PI) +
                "T" + (middle.x - text.attr().x) + "," + (middle.y - text.attr().y) +
                "T" + (-15 * dir.y) + "," + (-15 * dir.x);
            text.transform(trans);
        },

        getPointAt: function (length) {
            var line = this.getLine(),
                orig = line.getPointAtLength(length),
                matrix = Raphael.toMatrix(line, line.transform());
            return {
                x: matrix.x(orig.x, orig.y),
                y: matrix.y(orig.x, orig.y)
            };
        },

        getMiddle: function () {
            return this.getPointAt(this.getLine().getTotalLength() / 2);
        },

        getLine: function () {
            return this.el;
        },

        draw: function () {
            var nodeR = this.appView.options.nodeR,
                line = this.appView.paper.path(this.pathFormat()),
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

        drawInfo: function () {
            var middle = this.getMiddle();
            var text = this.appView.paper.text(middle.x, middle.y, this.infoFormat());
            this.transformInfo(text);
            return text;
        },

        erase: function (all) {
            if (all) {
                this.label && this.label.remove();
            }
            this.el && this.el.remove();
            this.trigger('app:deselect');
        },

        redraw: function () {
            this.erase();
            this.setElement(this.draw());

            this.transformInfo();

            this.DOMBindings();
            this.delegateRaphaelEvents();
        },

        DOMBindings: function () {
            _.extend(this.el.node, Backbone.Events).on("app:createEdge", function (params) {
                var e = $.event.fix(params.event);
                var from = this.model.get('from'),
                    to = this.model.get('to');

                // dont divide the same edge
                if (this.model.get('from') === params.from) {
                    return;
                }

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
                e = viewUtils.normalize(e);
                this.appView.clearSelected();
                this.selectedPoint = e.position;
                this.appView.selected.add(this);
            }, this);

            this.on("mouseover", function () {
                this.getLine().attr({
                    "stroke-width": "9",
                    "arrow-end": "classic-narrow-short"
                });
            }, this);

            this.on("mouseout", function () {
                this.getLine().attr(_.defaults({}, this.attrs, {
                    "stroke-dasharray": "",
                    "arrow-end": "classic-wide-long"
                }));
            }, this);

            this.on("app:select", function () {
                var point = this.selectedPoint || this.getMiddle();
                this.edgeEditView.render(point);
            }, this);

            this.on("app:deselect", function () {
                this.edgeEditView.remove();
            }, this);
        },

        ModelBindings: function () {
            this.listenTo(this.model, 'from:change:cx from:change:cy to:change:cx to:change:cy', _.throttle(this.redraw, 40), this);
            this.listenTo(this.model, 'destroy', function () {
                this.stopListening(this.model);
                this.erase(true);
            }, this);
            this.listenTo(this.model, 'change', function () {
                this.label.attr({
                    text: this.infoFormat()
                });
            }, this);
        }

    });
    return EdgeView;
});