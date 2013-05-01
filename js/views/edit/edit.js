/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/* global define*/
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var EditView = Backbone.View.extend({
        remove: function () {
            // clear global event listener
            $(document).off('keydown', this.removeOnEsc);
            // call super
            this.$el.stop().fadeOut(200);
        },

        removeOnEsc: function (event) {
            if (event.keyCode === 27) {
                this.remove();
            }
        },

        render: function (options) {
            $(document).on('keydown', this.removeOnEsc);

            this.$el.appendTo(this.options.appView.$el).css({
                position: "absolute",
                marginLeft: options.x,
                marginTop: options.y,
                display: "none",
                top: 0
            }).stop().fadeIn(200);
        },

        events: {
            "change input": "onChange"
        },

        onChange: function (event) {
            var $target = $(event.target),
                val;
            // assign to val, not typo 
            if (val = parseFloat($target.val())) {
                this.model.set($target.attr('data-holder'), val);
            }
        }
    });
    return EditView;
});