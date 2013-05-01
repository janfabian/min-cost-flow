define(['jquery', 'views/raphaelElement', 'views/layers/layer'], function ($, RaphaelElement, LayerView) {
    var MaskView = LayerView.extend({

        ViewBindings: function () {
            this.once("click", function () {
                this.el.remove();
            }, this);
        },
    });

    return MaskView;
});