define(['backbone', 'underscore'], function (Backbone, _) {
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

        defaults: function() {
            return {
                U: 0,
                L: 0, 
                C: 0 
            }
        }
    });
    return Edge;
});