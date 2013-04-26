define(['jquery', 'views/raphaelElement', 'views/node', 'views/edge'], function ($, RaphaelElement, NodeView, EdgeView) {
    var LayerView = RaphaelElement.extend({
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

    return LayerView;
});