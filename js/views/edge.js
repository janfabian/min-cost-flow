define(['jquery', 'underscore', 'views/raphaelElement'], function ($, _, RaphaelElement) {
    var EdgeView = RaphaelElement.extend({
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
    return EdgeView;
});