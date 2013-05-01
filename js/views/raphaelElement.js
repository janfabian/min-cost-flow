define(['backbone', 'underscore'], function (Backbone, _) {
    var raphaelEvents = ["mouseup", "mousedown", "mousemove", "mouseover",
        "mouseout", "click", "dblclick", "touchcancel",
        "touchend", "touchmove", "touchstart"];
        
    var RaphaelElement = Backbone.View.extend({

        delegateRaphaelEvents: function () {
            _.each(raphaelEvents, function (eventName) {
                this.el[eventName](_.bind(function (e) {
                    this.trigger(e.type, e);
                }, this));
            }, this);
        },

        eventBindings: function () {
            this.DOMBindings();
            this.ViewBindings();
            this.ModelBindings();
        },

        DOMBindings: function () {},
        ViewBindings: function () {},
        ModelBindings: function () {}

    });

    return RaphaelElement;
});