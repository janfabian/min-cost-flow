define(['jquery', 'views/raphaelElement'], function ($, RaphaelElement) {
    var LayerView = RaphaelElement.extend({
        initialize: function (options) {
            this.options = _.defaults(options, {
                attr: {},
                dontListen: false
            });
            this.width = options.width;
            this.height = options.height;
            this.appView = options.appView;
            this.setElement(this.draw());

            if(options.dontListen !== true) {
                this.eventBindings();
            }
            this.delegateRaphaelEvents();
        },

        draw: function () {
            return this.appView.paper.rect(0, 0, this.width, this.height).attr(_.extend({}, this.options, {
                fill: "white",
                opacity: 0
            }));
        },

    });

    return LayerView;
});