/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/* global define, console */
define(['jquery', 'underscore', 'backbone', 'views/edit/edit', 'text!templates/edit.html'], function ($, _, Backbone, EditView, editHTML) {
    var EditNodeView = EditView.extend({
        initialize: function () {
            this.setElement(this.template({
                type: 'Node',
                model: this.model,
                inputs: [{
                    name: 'Balance',
                    attr: 'b'
                }]
            }));

            this.removeOnEsc = _.bind(this.removeOnEsc, this);
        },

        template: _.template(editHTML),
    });
    return EditNodeView;
});