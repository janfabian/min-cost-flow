define(['collections/nodes', 'collections/edges'], function (Nodes, Edges) {
    var Dijkstra = function (graph) {
        this.graph = graph;
    };

    Dijkstra.prototype.start = function () {
        this.init();
        var n = 0,
            currentNode;
        while (n !== this.graph.nodes.length) {
            currentNode = _.first(this.sortUnvisited());
            this.visitNeighbors(currentNode);
            currentNode.get('dijkstra').visited = true;
            n++;
        }
    };

    Dijkstra.prototype.reversePath = function () {
        var nodes = new Nodes(),
            edges = new Edges(),
            currentNode = this.graph.last,
            prev;
        nodes.add(this.graph.last);
        while (!_.isUndefined(prev = currentNode.get('dijkstra').prev)) {
            if (prev) {
                nodes.add(prev, {
                    at: 0
                });
                var edge = currentNode.get('previous').findWhere({
                    from: prev
                });
                edges.add(edge, {
                    at: 0
                });
                currentNode = prev;
            }
        }
        if (currentNode === this.graph.last) {
            throw new Error("NoPath");
        }
        return {
            nodes: nodes,
            edges: edges
        };
    };

    Dijkstra.prototype.init = function () {
        this.graph.nodes.each(function (node) {
            node.set('dijkstra', {
                d: Infinity,
                visited: false
            });
        });
        this.graph.start.get('dijkstra').d = 0;
    };

    Dijkstra.prototype.sortUnvisited = function () {
        return _.sortBy(this.graph.nodes.map(function (node) {
            if (!node.get('dijkstra').visited) {
                return node;
            }
        }), function (node) {
            if (node) {
                return node.get('dijkstra').d;
            }
        });
    };

    Dijkstra.prototype.visitNeighbors = function (node) {
        node.get('adjacent').each(function (edge) {
            if (edge.get('U') <= 0) {
                return;
            }
            var value = node.get('dijkstra').d + edge.get('_Cpi');
            if (value < edge.get('to').get('dijkstra').d) {
                edge.get('to').get('dijkstra').d = value;
                edge.get('to').get('dijkstra').prev = node;
            }
        });
    };

    return function (graph) {
        return new Dijkstra(graph);
    };
});