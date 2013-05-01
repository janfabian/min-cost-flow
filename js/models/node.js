define(['backbone', 'underscore', 'collections/edges'], function (Backbone, _,  Edges) {

    var Node = Backbone.Model.extend({
        initialize: function () {
            this.eventBindings();
        },

        defaults: function() {
            return {
                b: 0,
                adjacent: new Edges(),
                previous: new Edges()
            }
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
                }
                this.get('adjacent').each(destroy, this);
                this.get('previous').each(destroy, this);
            }, this);
        }
    });
    
    return Node;
});