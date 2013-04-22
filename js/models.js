(function ($, Backbone, _) {
    var app = window.app; 
    
    var Node = app.Node = Backbone.Model.extend({

    });

    var Nodes = app.Nodes = Backbone.Collection.extend({
        model: Node
    });


}(jQuery, Backbone, _));