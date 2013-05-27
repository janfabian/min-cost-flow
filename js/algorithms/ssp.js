define(['algorithms/dijkstra', 'models/node', 'models/edge', 'collections/nodes', 'collections/edges'], function (dijkstra, Node, Edge, Nodes, Edges) {
    var SSP = function (graph) {
        this.graph = graph;
    };

    SSP.prototype.start = function () {
        this._prepare();

        this.dijkstra = dijkstra(this.graph);
        for (var i = 10e6; i >= 0; i--) {
            if (this.source.get('b') === 0 && this.sink.get('b') === 0) {
                break;
            }
            this._step();
        }

        this._clean();
    };

    SSP.prototype._clean = function () {
        this.toAdd.each(function (edge) {
            this.graph.edges.add(edge, {
                silent: true
            });
        }, this);
        this.toRemove.each(function (edge) {
            this.graph.edges.remove(edge, {
                silent: true
            });
        }, this);
        this.graph.edges.each(function (edge) {
            edge.set({
                U: edge.get('_U'),
                x: edge.get('x') + edge.get('_L'),
                L: edge.get('_L')
            }, {
                silent: true
            });
        });
        this.graph.nodes.each(function (node) {
            node.set({
                _pi: 0,
                b: node.get('_b')
            }, {
                silent: true
            });
        });
        this.source.destroy();
        this.sink.destroy();
    };

    SSP.prototype._prepare = function () {
        this.source = this.graph.start = new Node();
        this.sink = this.graph.last = new Node();
        this.toAdd = new Edges();
        this.toRemove = new Edges();

        this._removePrevX();
        this._saveOriginValues();
        this._removeLowerBound();
        this._addSourceSink();
    };

    SSP.prototype._removePrevX = function () {
        this.graph.edges.each(function (edge) {
            edge.set('x', 0, {
                silent: true
            });
        });
    };

    SSP.prototype._saveOriginValues = function () {
        this.graph.edges.each(function (edge) {
            edge.set({
                _U: edge.get('U'),
                _L: edge.get('L')
            }, {
                silent: true
            });
        });

        this.graph.nodes.each(function (node) {
            node.set('_b', node.get('b'), {
                silent: true
            });
        });
    };

    SSP.prototype._removeLowerBound = function () {
        this.graph.edges.each(function (edge) {
            var L = edge.get('L'),
                U = edge.get('U'),
                from = edge.get('from'),
                to = edge.get('to');
            // normalize nodes
            from.set('b', from.get('b') - L, {
                silent: true
            });
            to.set('b', to.get('b') + L, {
                silent: true
            });

            // edge
            edge.set({
                L: 0,
                U: U - L
            }, {
                silent: true
            });
        });
    };

    SSP.prototype._addSourceSink = function () {
        this.graph.nodes.each(function (node) {
            if (node.get('b') > 0) {
                this.source.set('b', this.source.get('b') + node.get('b'));
                new Edge({
                    from: this.source,
                    to: node,
                    U: node.get('b')
                });
            } else if (node.get('b') < 0) {
                this.sink.set('b', this.sink.get('b') + node.get('b'));
                new Edge({
                    from: node,
                    to: this.sink,
                    U: -node.get('b')
                });
            }
            node.set('b', 0, {
                silent: true
            });
        }, this);
        if (this.source.get('b') !== this.sink.get('b')) {
            var minVal = Math.min.apply(null, [this.source.get('b'), -this.sink.get('b')]);
            this.source.set('b', minVal);
            this.sink.set('b', -minVal);
        }
        this.graph.nodes.add([this.source, this.sink], {
            silent: true
        });
    };

    SSP.prototype._step = function () {
        this._updateCpi();
        this.dijkstra.start();
        this._updatePi();
        this._augmentPath(this.dijkstra.reversePath(), this._deltaUnits());
    };

    SSP.prototype._deltaUnits = function () {
        var path = this.dijkstra.reversePath();
        var minEdge = path.edges.reduce(function (minEdge, edge) {
            if (edge.get('U') < minEdge.get('U')) {
                return edge;
            } else {
                return minEdge;
            }
        }, path.edges.first());
        return Math.min.apply(null, [this.source.get('b'), -this.sink.get('b'), minEdge.get('U')]);
    };

    SSP.prototype._augmentPath = function (path, amount) {
        this.source.set('b', this.source.get('b') - amount);
        this.sink.set('b', this.sink.get('b') + amount);

        path.edges.each(function (edge) {
            edge.set({
                x: edge.get('x') + amount,
                U: edge.get('U') - amount
            }, {
                silent: true
            });
            if (edge.get('U') <= 0) {
                this.toAdd.add(edge);
                this.graph.edges.remove(edge, {
                    silent: true
                });
            }
        }, this);

        var prev = null;
        path.nodes.each(function (node) {
            if (prev) {
                var prevEdge;
                if (node.existEdgeTo(prev)) {
                    prevEdge = node.get('adjacent').findWhere({
                        to: prev
                    });
                } else {
                    prevEdge = new Edge({
                        from: node,
                        to: prev
                    });
                    this.toRemove.push(prevEdge);
                }
                prevEdge.set('U', prevEdge.get('U') + amount, {
                    silent: true
                });
            }
            prev = node;
        }, this);

    };

    SSP.prototype._updatePi = function () {
        this.graph.nodes.each(function (node) {
            if (!node.get('dijkstra')) {
                return;
            }
            node.set('_pi', node.get('_pi') - node.get('dijkstra').d, {
                silent: true
            });
        });
    };

    SSP.prototype._updateCpi = function () {
        this.graph.edges.each(function (edge) {
            var newCpi = edge.get('C') - edge.get('from').get('_pi') + edge.get('to').get('_pi');
            edge.set('_Cpi', newCpi, {
                silent: true
            });
        });
    };

    return SSP;
});