var nodes = [];
var force;
var svg;

var width = 4000, height = 2000;

var color = d3.scale.category10();

// number of seconds between getting the new viewercount data
var updateInterval = 5;

// is there a formal way of doing this, maybe semaphores
var viewcountRequestHappening = true;
var lastViewcountRequest = new Date() / 1000;

// the time in ms for the update transition
var updateTransitionTime = 500;

// the time in ms for the enter transition
var enterTransitionTime = 500;

// the time in ms for the exit transition
var exitTransitionTime = 500;

// get the current list of streams and viewercounts
$.ajax({
    url: "http://localhost:5000/streams/viewercounts",
    success: function(data) {
        for (var streamer in data) {
            nodes.push({
                streamer: streamer,
                viewcount: data[streamer],
                radius: normalizeRadius(data[streamer]),
                root: "false"
            });
        }
        viewcountRequestHappening = false;
        initializeLayout();
    },
});

function normalizeRadius(radius) {
    return 4*Math.log2(radius) + 20;
}

function onClick(d, i) {
     // set this circle as being root
     d3.selectAll("circle").attr("root", false);
     d3.select(this).attr("root", true);
}

function updateLayout() {
    var circles = svg.selectAll("circle")
        .data(nodes, function(d) {
            return d.streamer;
        });

    circles.transition()
        .duration(updateTransitionTime)
        .attr("r", function(d) { return d.radius; })
        .attr("viewcount", function(d) { return d.viewcount; });

    enter = circles.enter().append("circle");
    enter.attr("r", 0)
      .transition()
        .duration(enterTransitionTime)
        .attr("r", function(d) {return d.radius; });
    enter.attr("streamer", function(d) { return d.streamer; })
        .attr("viewcount", function(d) { return d.viewcount; })
        .attr("root", false)
        .style("fill", function(d, i) { return color(i % 3); })
        .on("click", onClick);

    circles.exit().transition()
        .duration(exitTransitionTime)
        .attr("r", 0)
        .remove();
}


function initializeLayout() {
    force = d3.layout.force()
          .gravity(0.004)
          // if the node is at 0 (it is root) and its charge is -2000
          // .charge(function(d, i) { return i ? 0 : -2000; })
          .nodes(nodes)
          .size([width, height]);

    force.start();

    svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);

    circles = svg.selectAll("circle")
                 .data(nodes, function(d) {
                     return d.streamer;
                 });

    circles.enter().append("circle")
             .attr("r", function(d) { return d.radius; })
             .attr("streamer", function(d) { return d.streamer; })
             .attr("viewcount", function(d) { return d.viewcount; })
             .attr("root", false)
             .style("fill", function(d, i) { return color(i % 3); })
             .on("click", onClick);

    force.on("tick", function(e) {

        // if at least updateInterval seconds have passed since last viewcount update
        // and if there isn't a current request happening
        if (((new Date() / 1000) - lastViewcountRequest >= updateInterval) && !viewcountRequestHappening) {
            lastViewcountRequest = new Date() / 1000;
            viewcountRequestHappening = true;
            $.ajax({
                url: "http://localhost:5000/streams/viewercounts",
                success: function(data) {
                    // record the old positions of nodes
                    var oldPositions = {};
                    nodes.forEach(node => oldPositions[node.streamer] = {
                        x: node.x,
                        y: node.y,
                        px: node.px,
                        py: node.py,
                    });

                    nodes = [];
                    for (var streamer in data) {
                        // if this is an old node that already has a position copy it over
                        if (streamer in oldPositions) {
                            nodes.push({
                                streamer: streamer,
                                viewcount: data[streamer],
                                radius: normalizeRadius(data[streamer]),
                                root: "false",
                                x: oldPositions[streamer].x,
                                y: oldPositions[streamer].y,
                                px: oldPositions[streamer].px,
                                py: oldPositions[streamer].py,
                            });
                        } else {
                            nodes.push({
                                streamer: streamer,
                                viewcount: data[streamer],
                                radius: normalizeRadius(data[streamer]),
                                root: "false"
                            });
                        }
                    }

                    viewcountRequestHappening = false;
                    force.nodes(nodes);
                    force.start();
                    updateLayout();
                },
            });
        }

        // a quadtree is a recurssive spatial subdivision
        // each square is split into 4 subsquares
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        // call collide on every node pair
        while (++i < n) q.visit(collide(nodes[i]));

        svg.selectAll("circle")
             .attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });

        svg.selectAll("circle")
             .attr("x", function(d, i) {
                 if (d3.select(this).attr("root").localeCompare("true") === 0) {
                     var xDistance = (width / 2) - d.x;
                     if (xDistance > 3)
                         return d.x += 1;
                     else if (xDistance < -3)
                         return d.x -= 1;
                     else
                         return width / 2;
                 }
             })
             .attr("y", function(d, i) {
                 if (d3.select(this).attr("root").localeCompare("true") === 0) {
                     var yDistance = (height / 2) - d.y;
                     if (yDistance > 3)
                         return d.y += 1;
                     else if (yDistance < -3)
                         return d.y -= 1;
                     else
                         return height / 2;
                 }
             });
        force.resume();
    });

    /*
    svg.on("mousemove", function() {
        var p1 = d3.mouse(this);
        root.px = p1[0];
        root.py = p1[1];
        force.resume();
    });
    */
}

function collide(node) {
    var r = node.radius + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * 0.5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}

