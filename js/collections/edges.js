define([
    'backbone',
    'underscore',
    'models/edge'], function (Backbone, _, Edge) {
    var Edges = Backbone.Collection.extend({
        model: Edge,
        print: function () {
            this.each(function (edge) {
                console.log("C: " + edge.get('C') + ", L: " + edge.get('L') +
                    " U: " + edge.get('U') + " x: " + edge.get('x'));
            });
        }
    });
    return Edges;
});