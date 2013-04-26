define(['backbone', 'underscore', 'models/node'], function (Backbone, _, Node) {
    var Nodes = Backbone.Collection.extend({
        model: Node,

        findByTarget: function (target) {
            this.find(function (node) {
                return node.el.node === target;
            });
        }
    });
    return Nodes;
});