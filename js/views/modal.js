define(['jquery', 'backbone', 'underscore', 'text!templates/modal.html'], function ($, Backbone, _, modalTmpl) {
    var ModalView = Backbone.View.extend({
        tagName: 'section',
        className: 'modal-window',
        initialize: function () {
            this.$el.html(this.template());
            this.createBackground();
        },
        events: {
            "click .close": "remove"
        },
        template: _.template(modalTmpl),
        createBackground: function () {
            this.$background = $('<div />').addClass('background-black').on('click', _.bind(function () {
                this.remove();
                return false;
            }, this));
        },
        remove: function () {
            this.$background.remove();
            Backbone.View.prototype.remove.apply(this, arguments);
            this.trigger('closed');
            $(window).off('keydown', this.bRemoveOnEsc);
            $(window).off('resize', this.bResize);
        },
        removeOnEsc: function (event) {
            if (event.keyCode === 27) {
                this.remove();
            }
        },
        render: function () {
            var $window = $(window);
            // escape key listener
            $window.on('keydown', this.bRemoveOnEsc = _.bind(this.removeOnEsc, this));
            $window.on('resize', this.bResize = _.bind(this.resize, this));

            $('body').append(this.$background).append(this.$el);
            this.resize();
        },
        resize: function () {
            var $window = $(window);
            this.$el.css({
                top: 50,
                left: ($window.width() - this.$el.width()) / 2,
                height: $window.height() - 100
            });
        }
    });

    return ModalView;
});