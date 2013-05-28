define([
    'jquery',
    'backbone',
    'underscore',
    'raphael',
    'data/tutorial',
    'text!templates/tutorial/1.html',
    'text!templates/tutorial/2.html',
    'text!templates/tutorial/3.html',
    'text!templates/tutorial/4.html',
    'text!templates/tutorial/5.html',
    'text!templates/tutorial/6.html',
    'text!templates/tutorial/7.html'], function ($, Backbone, _, Raphael, tutorialData, step1, step2, step3, step4, step5, step6, step7) {
    var Tutorial = function (app, router) {
        this.app = app;
        this.router = router;
        this.steps = [step1, step2, step3, step4, step5, step6, step7];
        this.router.on('route', function (route) {
            if (!/tutorial/.test(route)) {
                this.clearTemp();
            }
        }, this);
        this.temp = [];
    };

    Tutorial.prototype.step1 = function () {
        var nodeR = this.app.options.nodeR;
        var tempC = this.app.paper.circle(450, 350, nodeR).attr({
            "stroke-dasharray": "-",
            "stroke-width": 3,
            fill: "white"
        }).click(_.bind(function () {
            this.app.nodes.add({
                cx: tempC.attr('cx'),
                cy: tempC.attr('cy'),
                b: 0
            });
            this.router.navigate('tutorial/2', {
                trigger: true
            });
        }, this));
        this.temp.push(tempC);
    };

    Tutorial.prototype.step2 = function () {
        var source = this.app.nodes.first(),
            sink = this.app.nodes.at(2),
            newly = this.app.nodes.last(),
            tempLine1 = this.app.paper.path("M" + source.get('cx') + "," + source.get('cy') + "T" + newly.get('cx') + "," + newly.get('cy')).attr({
                "stroke-dasharray": "-",
                "stroke-width": 3,
                fill: "black",
                "stroke-opacity": 0.3
            }).toBack(),
            tempLine2 = this.app.paper.path("M" + newly.get('cx') + "," + newly.get('cy') + "T" + sink.get('cx') + "," + sink.get('cy')).attr({
                "stroke-dasharray": "-",
                "stroke-width": 3,
                fill: "black",
                "stroke-opacity": 0.3
            }).toBack();

        var subSteps = 0;
        var callback = function (e) {
            if ((e.get('from') === source && e.get('to') === newly) || (e.get('from') === newly && e.get('to') === sink)) {
                subSteps++;
            }
            if (subSteps === 2) {
                this.router.navigate('tutorial/3', {
                    trigger: true
                });
                this.app.edges.off('add', callback);
            }
        };
        this.app.edges.on('add', callback, this);
        this.temp.push(tempLine1, tempLine2);
    };

    Tutorial.prototype.step3 = function () {
        // add temp dashed point
        var nodeR = this.app.options.nodeR;
        var tempC = this.app.paper.circle(40, 40, nodeR).attr({
            "stroke-dasharray": "-",
            "stroke-width": 3
        });
        this.temp.push(tempC);

        // setup listeners
        var source = this.app.nodes.first();
        var callback = _.debounce(function (s) {
            if (Raphael.isPointInsideBBox(tempC.getBBox(), s.get('cx'), s.get('cy'))) {
                this.router.navigate('tutorial/4', {
                    trigger: true
                });
                source.off('change:cx change:cy', callback);
            }
        }, 100);
        source.on('change:cx change:cy', callback, this);
    };

    Tutorial.prototype.step4 = function () {
        // setup listeners
        var source = this.app.nodes.first();
        source.get('adjacent').each(function (e) {
            e.on('change:C', function callback() {
                if (source.get('adjacent').every(function (e) {
                    return e.get('C') === 4;
                })) {
                    e.off('change:C', callback);
                    this.router.navigate('tutorial/5', {
                        trigger: true
                    });
                }
            }, this);
        }, this);
    };

    Tutorial.prototype.step5 = function () {
        var callback;
        this.app.nodes.at(2).on('change:xReceived', function () {
            this.router.navigate('tutorial/6', {
                trigger: true
            });
        }, this);
        $("button#mcfp").on('click', callback = _.bind(function () {
            this.app.mincost();
            $("button#mcfp").off('click', callback);
        }, this));
    };

    Tutorial.prototype.step6 = function () {
        var callback;
        this.app.nodes.at(1).on('change:xReceived', function (n, x) {
            if (x > 0) {
                this.router.navigate('tutorial/7', {
                    trigger: true
                });
                $("button#mcfp").off('click', callback);
            }
        }, this);
        $("button#mcfp").on('click', callback = _.bind(function () {
            this.app.mincost();
        }, this));
    };

    // remove temporary svg object
    Tutorial.prototype.clearTemp = function () {
        _.each(this.temp, function (t) {
            t.remove();
        });
        this.temp = [];
    };

    Tutorial.prototype.createStep = function (step) {
        if (step < 7) {
            this.app.clear();
            this.clearTemp();
            this.router.loadData(tutorialData[step - 1]);
        }
        $('#text article').html(_.template(this.steps[step - 1])());
        var fn = this['step' + step];
        if (_.isFunction(fn)) {
            fn.call(this);
        }
    };

    return Tutorial;
});