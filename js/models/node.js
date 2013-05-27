define(['backbone', 'underscore', 'collections/edges'], function (Backbone, _, Edges) {

    var Node = Backbone.Model.extend({
        initialize: function () {
            this.eventBindings();
        },

        defaults: function () {
            return {
                b: 0,
                _pi: 0,
                adjacent: new Edges(),
                previous: new Edges(),
                xReceived: 0
            };
        },

        receive: function (x) {
            this.set('xReceived', this.get('xReceived') + x);
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
                var model;

                while (model = this.get('adjacent').first()) {
                    model.destroy();
                }

                while (model = this.get('previous').first()) {
                    model.destroy();
                }
            }, this);

            this.on('change:xReceived', function () {
                if ((this.get('b') === 0 && this.get('xReceived') >= this.get('adjacent').reduce(function (memo, edge) {
                    return memo + edge.get('x');
                }, 0)) || (this.get('b') !== 0 && this.get('xReceived') >= Math.abs(this.get('b')))) {
                    this.trigger('app:sendStuff');
                    this.set('xReceived', 0, {
                        silent: true
                    });
                }
            }, this);
        }
    });

    return Node;
});