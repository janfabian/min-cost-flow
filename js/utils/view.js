define(['jquery'], function ($) {
    var $canvas = $("#canvas-container");
    return {
        normalize: function (e) {
            var nodeR = 20;
            // min
            e.position = {
                x: Math.max.apply(null, [nodeR, e.pageX - $canvas.offset().left]),
                y: Math.max.apply(null, [nodeR, e.pageY - $canvas.offset().top])
            };
            // max
            e.position = {
                x: Math.min.apply(null, [$canvas.width() - nodeR, e.position.x]),
                y: Math.min.apply(null, [$canvas.height() - nodeR, e.position.y])
            };
            return e;
        },

        length: function(vector) {
            return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        },

        normalizeVector: function (vector) {
            var length = this.length(vector);
            return {
                x: vector.x / length,
                y: vector.y / length
            };
        }
    };
});