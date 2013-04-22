(function ($, Backbone, _) {
    var app = window.app;

    var Node = Backbone.Model.extend({

    });

    var Nodes = Backbone.Collection.extend({
        model: Node
    });

    /* Edge Model 
    ==============================================
    from    : Node
    to      : Node
    */
    var Edge = Backbone.Model.extend({
        pathFormat: function() {

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