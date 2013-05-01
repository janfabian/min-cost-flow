/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/* global define, console */
define(['jquery', 'underscore', 'backbone', 'views/edit/edit', 'text!templates/edit.html'], function ($, _, Backbone, EditView, editHTML) {
    var EditEdgeView = EditView.extend({
        initialize: function () {
            this.setElement(this.template({
                type: "Edge",
                model: this.model,
                inputs: [{
                    name: 'Upper',
                    attr: 'U'
                }, {
                    name: 'Lower',
                    attr: 'L'
                }, {
                    name: 'Cost',
                    attr: 'C'
                }]
            }));

            this.removeOnEsc = _.bind(this.removeOnEsc, this);
        },

        template: _.template(editHTML),
    });
    return EditEdgeView;
});