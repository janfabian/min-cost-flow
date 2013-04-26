define(['backbone', 'underscore', 'models/edge'], function (Backbone, _, Edge) {
    var Edges = Backbone.Collection.extend({
        model: Edge
    });
    return Edges;
});