var nodes = [];
var force;
var svg;

var width = 2000, height = 2000;

var color = d3.scale.category10();

var root_node = null;

// number of seconds between getting the new viewercount data
var update_interval = 10;

var viewcount_request_happening = true;
var last_viewcount_request = new Date() / 1000;

$.ajax({
    url: "http://localhost:5000/streams/viewercounts",
    success: function(data) {
        for (var streamer in data) {
            nodes.push({
                streamer: streamer,
                radius: normalize_radius(data[streamer]),
                root: "false"
            });
        }
        viewcount_request_happening = false;
        initialize_layout();
    },
});

function normalize_radius(radius) {
    return 2*Math.log(radius);
}

function update_layout() {
    svg.selectAll("circle")
        .attr("r", function(d) {
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].streamer == d.streamer)
                    // if (nodes[j].radius != d.radius) {
                    //     console.log("streamer has a change in viewcount");
                    // }
                    return nodes[j].radius;
            }
            return 0;
        });
}


function initialize_layout() {
    force = d3.layout.force()
          .gravity(0.05)
          // if the node is at 0 (it is root) and its charge is -2000
          // .charge(function(d, i) { return i ? 0 : -2000; })
          .nodes(nodes)
          .size([width, height]);

    force.start();

    svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);

    svg.selectAll("circle")
         //.data(nodes.slice(1))
         .data(nodes)
       .enter().append("circle")
         .attr("r", function(d) { return d.radius; })
         .attr("streamer", function(d) { return d.streamer; })
         .attr("root", false)
         .style("fill", function(d, i) { return color(i % 3); })
         .on("click", function(d, i) {
             // TODO scope is out of wack. Find a way to set this value
             // try having a root attribute to every circle, and set it to true here
             d3.selectAll("circle").attr("root", false);
             d3.select(this).attr("root", true);
         });

    force.on("tick", function(e) {

        // if at least update_interval seconds have passed since last viewcount update
        // and if there isn't a current request happening
        if (((new Date() / 1000) - last_viewcount_request >= update_interval) && !viewcount_request_happening) {
            last_viewcount_request = new Date() / 1000;
            viewcount_request_happening = true;
            nodes = [];
            $.ajax({
                url: "http://localhost:5000/streams/viewercounts",
                success: function(data) {
                    for (var streamer in data) {
                        nodes.push({streamer: streamer, radius: normalize_radius(data[streamer])});
                    }
                    viewcount_request_happening = false;
                    update_layout();
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
                     var x_distance = (width / 2) - d.x;
                     if (x_distance > 3)
                         return d.x += 1;
                     else if (x_distance < -3)
                         return d.x -= 1;
                     else
                         return width / 2;
                 }
             })
             .attr("y", function(d, i) {
                 if (d3.select(this).attr("root").localeCompare("true") === 0) {
                     var y_distance = (height / 2) - d.y;
                     if (y_distance > 3)
                         return d.y += 1;
                     else if (y_distance < -3)
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

