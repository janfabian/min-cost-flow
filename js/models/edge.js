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
            this.get("from").get("adjacent").push(this);
            this.get("to").get("previous").push(this);

            this.eventBindings();
        },

        defaults: function () {
            return {
                U: Infinity,
                L: 0,
                C: 0,
                _Cpi: 0,
                x: 0
            };
        },

        eventBindings: function () {
            this.on('destroy', function (node) {
                this.get("from").get("adjacent").remove(this);
                this.get("to").get("previous").remove(this);
            }, this);
        }

    });
    return Edge;
});