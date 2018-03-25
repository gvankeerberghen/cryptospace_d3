//Read the data from the mis element
var graph = document.getElementById("json").innerHTML;
graph = JSON.parse(graph);
render(graph);

function render(graph) {
  // Dimensions of sunburst.
  var radius = 6;

  var maxValue = d3.max(graph.links, function(d, i, data) {
    return d.value;
  });

  //sub-in max-value from
  d3
    .select("div")
    .html(
      '<form class="force-control" ng-if="formControl">Link threshold 0 <input type="range" id="thersholdSlider" name="points" value="0" min="0" max="' +
        maxValue +
        '">' +
        maxValue +
        "</form>"
    );

  document.getElementById("thersholdSlider").onchange = function() {
    threshold(this.value);
  };

  var svg = d3.select("svg");
  var width = svg.attr("width");
  var height = svg.attr("height");

  console.log(graph);
  var graphRec = JSON.parse(JSON.stringify(graph)); //Add this line
  //graphRec = graph; //Add this line
  console.log(graphRec);

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force(
      "charge",
      d3.forceManyBody().strength(Number(-1000 + 1.25 * graph.links.length))
    ) //default force is -30, making weaker to increase size of chart
    .force("center", d3.forceCenter(width / 2, height / 2));

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke-width", function(d) {
      return Math.sqrt(d.value);
    });

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", radius)
    .attr("fill", function(d) {
      return d.color;
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node.append("title").text(function(d) {
    return d.id;
  });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

  console.log(link.data(graph.links));

  function ticked() {
        node
      .attr("cx", function(d) {
        return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
      })
      .attr("cy", function(d) {
        return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
      })
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function threshold(thresh) {
    thresh = Number(thresh);
    graph.links.splice(0, graph.links.length);
    for (var i = 0; i < graphRec.links.length; i++) {
      if (graphRec.links[i].value > thresh) {
        graph.links.push(graphRec.links[i]);
      }
    }

    console.log(graph.links);
    /*var threshold_links = graph.links.filter(function(d){ return (d.value > thresh);});
			console.log(graph.links);
			
			restart(threshold_links);*/
    restart();
  }

  //Restart the visualisation after any node and link changes
  //	function restart(threshold_links) {
  function restart() {
    //DATA JOIN
    //link = link.data(threshold_links);
    link = link.data(graph.links);
    console.log(link);

    //EXIT
    link.exit().remove();
    console.log(link);

    // ENTER - https://bl.ocks.org/colbenkharrl/21b3808492b93a21de841bc5ceac4e47
    // Create new links as needed.
    link = link
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke-width", function(d) {
        return Math.sqrt(d.value);
      })
      .merge(link);
    console.log(link);

    // DATA JOIN
    node = node.data(graph.nodes);

    /*
			// EXIT
			node.exit().remove();

			// ENTER
			node = node.enter().append("circle")
				.attr("class", "node")
				.attr("r", radius)
				.attr("fill", function(d) {return d.color;})
				.call(d3.drag()
				  .on("start", dragstarted)
				  .on("drag", dragged)
				  .on("end", dragended)
				)
				.merge(node);
			
			node.append("title")
			.text(function(d) { return d.id; });
			*/

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    simulation.alphaTarget(0.3).restart();
  }
}
