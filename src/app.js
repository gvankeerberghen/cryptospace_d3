import * as d3 from 'd3'

const BORDER_PADDING = 6;
const FORCE_STRENGTH = -7;
const FORCE_LINK_STRENGTH = 2;
const MAX_DISTANCE = 150;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory10);

const force = d3.forceManyBody()
  .strength(FORCE_STRENGTH)
  .distanceMax(MAX_DISTANCE);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(FORCE_LINK_STRENGTH))
    .force("charge", force)
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/transformed.json").then( graph => {
  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .style("fill", function (d,i) { return color(d); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation
    .force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
     .attr("cx", function(d) {
        return (d.x = Math.max(BORDER_PADDING, Math.min(width - BORDER_PADDING, d.x)));
      })
     .attr("cy", function(d) {
        return (d.y = Math.max(BORDER_PADDING, Math.min(height - BORDER_PADDING, d.y)));
     })
     .on('dblclick', dbClick)
  }
})
.catch(error => {
    console.log('Failed to load data', error);
    throw error;
});

function dbClick(d) {
  d.fx = null;
  d.fy = null;
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.1).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
}
