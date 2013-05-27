define(['jquery', 'views/raphaelElement', 'views/node', 'views/edge', 'views/layers/layer', 'utils/view'], function ($, RaphaelElement, NodeView, EdgeView, LayerView, viewUtils) {
    var BackgroundView = LayerView.extend({

        DOMBindings: function () {
            _.extend(this.el.node, Backbone.Events).on("app:createEdge", function (params) {
            }, this);
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

        createNode: function (e) {
            e = viewUtils.normalize(e);
            this.appView.nodes.add([{
                cx: e.position.x,
                cy: e.position.y
            }]);
        }
    });
    return BackgroundView;
});