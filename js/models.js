(function ($, Backbone, _) {
    var app = window.app;

    var Node = Backbone.Model.extend({

    });

    var Nodes = Backbone.Collection.extend({
        model: Node,

        findByTarget: function (target) {
            this.find(function (node) {
                return node.el.node === target;
            });
        }
    });

    /* Edge Model 
    ==============================================
    from    : Node
    to      : Node
    */
    var Edge = Backbone.Model.extend({
        initialize: function () {
            _.each(["from", "to"], function (node) {
                _.each(["cx", "cy"], function (prop) {
                    this.get(node).on('change:' + prop, function () {
                        this.trigger(node + ':change:' + prop);
                    }, this);
                }, this);
            }, this);
        },
        pathFormat: function () {
            return "M" + this.get("from").get("cx") + "," + this.get("from").get("cy") +
                "L" + this.get("to").get("cx") + "," + this.get("to").get("cy");
        }
    });

    var Edges = Backbone.Collection.extend({
        model: Edge
    });

    _.extend(app, {
        Node: Node,
        Nodes: Nodes,
        Edge: Edge,
        Edges: Edges
    });

}(jQuery, Backbone, _));