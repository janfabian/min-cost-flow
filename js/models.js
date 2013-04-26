(function ($, Backbone, _) {
    var app = window.app;

    var Node = Backbone.Model.extend({
        initialize: function () {
            this.set('adjacent', new Edges());
            this.set('previous', new Edges());

            this.eventBindings();
        },

        existEdgeFrom: function (from) {
            return this.get('previous').findWhere({
                from: from
            }) ? true : false;
        },

        existEdgeTo: function (to) {
            return this.get('adjacent').findWhere({
                to: to
            }) ? true : false;
        },

        eventBindings: function () {
            this.on('destroy', function (node) {
                function destroy(edge) {
                    _.defer(function () {
                        edge.destroy();
                        edge.off();
                    });
                };
                this.get('adjacent').each(destroy, this);
                this.get('previous').each(destroy, this);
            }, this);
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
            var from = this.get("from");
            var to = this.get("to");
            from.get("adjacent").push(this);
            to.get("previous").push(this);
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