define(['jquery', 'underscore', 'backbone', 'utils/view'], function ($, _, Backbone, utilsView) {
    var EditView = Backbone.View.extend({
        remove: function () {
            // clear global event listener
            $(document).off('keydown', this.removeOnEsc);
            // call super
            this.$el.stop().fadeOut(200);
        },

        removeOnEsc: function (event) {
            if (event.keyCode === 27) {
                $(event.target).blur();
                this.remove();
            }
        },

        render: function (options) {
            $(document).on('keydown', this.removeOnEsc);

            this.$el.appendTo(this.options.appView.$el).css({
                position: "absolute",
                marginLeft: options.x+1,
                marginTop: options.y+1,
                display: "none",
                top: 0
            }).stop().fadeIn(200);
        },

        events: {
            "change input": "onChange"
        },

        onChange: function (event) {
            var $target = $(event.target),
                val = parseFloat($target.val());
            // assign to val, not typo 
            if (_.isNumber(val) && !_.isNaN(val)) {
                this.model.set($target.attr('data-holder'), val);
            }
            else if ($target.val() === "" && $target.attr('data-holder') === "U") {
                this.model.set("U", Infinity);
            }
        }
    });
    return EditView;
});