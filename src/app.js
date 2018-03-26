import * as d3 from 'd3'

const { flatMap, map, range, uniq } = require('lodash/fp');

const BORDER_PADDING = 6;
const FORCE_STRENGTH = -15;
const FORCE_LINK_STRENGTH = 2;
const MAX_DISTANCE = 150;

const LABEL_ANCHOR_FORCE_STRENGTH = -1;
const LABEL_ANCHOR_MAX_DISTANCE = 40;
const LABEL_ANCHOR_LINK_DISTANCE = 2;
const LABEL_ANCHOR_LINK_STRENGTH = 2;

const svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

const color = d3.scaleOrdinal(d3.schemeSet3);

const chargeForce = d3.forceManyBody()
  .strength(FORCE_STRENGTH)
  .distanceMax(MAX_DISTANCE);

const linkForce = d3.forceLink()
  .id(d => d.id)
  .strength(FORCE_LINK_STRENGTH);

const simulation = d3.forceSimulation()
  .force('link', linkForce)
  .force('charge', chargeForce)
  .force('center', d3.forceCenter(width / 2, height / 2));

const labelAnchorChargeForce = d3.forceManyBody()
  .strength(LABEL_ANCHOR_FORCE_STRENGTH)
  .distanceMax(LABEL_ANCHOR_MAX_DISTANCE);

const labelAnchorLinkForce = d3.forceLink()
  .distance(LABEL_ANCHOR_LINK_DISTANCE)
  .strength(LABEL_ANCHOR_LINK_STRENGTH);

const simulationLabels = d3.forceSimulation()
  .force('charge', labelAnchorChargeForce)
  .force('link', labelAnchorLinkForce);

d3.json('data/transformed.json').then( graph => {
  const labelAnchors = flatMap(
    node => node.group != 'Individual' ? [{node: node}, {node: node}] : []
    ,
    graph.nodes
  );

  const labelAnchorLinks = map(
    i => ({
      source: i * 2,
      target: i * 2 + 1,
      weight: 1
    })
    ,
    range(0, labelAnchors.length / 2)
  );

  color.domain(uniq(map(d => d.group, graph.nodes)));

  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line.nodeLink')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'nodeLink')
    .attr('stroke-width', d => Math.sqrt(d.value));

  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter().append('circle')
      .attr('r', d => d.group === 'Individual' ? 4 : 8)
      .style('fill', d => color(d.group))
      .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

  const anchorLink = svg
    .append('g')
    .selectAll('line.anchorLink')
    .data(labelAnchorLinks).enter().append('line')
    .attr('class', 'anchorLink');

  const anchorNode = svg
    .append('g')
    .selectAll('g.anchorNode')
    .data(labelAnchors)
    .enter()
      .append('g')
      .attr('class', 'anchorNode')
      .attr('i', (d, i) => i );
   
   anchorNode.append('circle').attr('r', 0);
   anchorNode.append('text')
    .attr('class', 'label')
    .text((d, i) => i % 2 == 0 ? '' : d.node.label);

  simulation
    .nodes(graph.nodes);

  simulation
    .force('link')
    .links(graph.links);

  simulationLabels
    .nodes(labelAnchors);

  simulationLabels
    .force('link')
    .links(labelAnchorLinks);

  simulation.on('tick', ticked);

  function ticked() {
    node
     .attr('cx', d =>
        (d.x = Math.max(BORDER_PADDING, Math.min(width - BORDER_PADDING, d.x)))
      )
     .attr('cy', d =>
        (d.y = Math.max(BORDER_PADDING, Math.min(height - BORDER_PADDING, d.y)))
     )

    anchorNode.each(function(d, i) {
      if(i % 2 == 0) {
        d.x = d.node.x;
        d.y = d.node.y;
      } else {
        const b = this.childNodes[1].getBBox();

        const diffX = d.x - d.node.x;
        const diffY = d.y - d.node.y;

        const dist = Math.sqrt(diffX * diffX + diffY * diffY);

        let shiftX = b.width * (diffX - dist) / (dist * 2);
        shiftX = Math.max(-b.width, Math.min(0, shiftX));
        const shiftY = 15;
        this.childNodes[1].setAttribute('transform', 'translate(' + shiftX + ',' + shiftY + ')');
      }
    });

    anchorNode
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

    link
      .attr('x1', d => d.source.x )
      .attr('y1', d => d.source.y )
      .attr('x2', d => d.target.x )
      .attr('y2', d => d.target.y );

    anchorLink
      .attr('x1', d => d.source.x )
      .attr('y1', d => d.source.y )
      .attr('x2', d => d.target.x )
      .attr('y2', d => d.target.y );  
  }
  
  function dragstarted(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.1).restart();
      simulationLabels.alphaTarget(0.1).restart();
    };
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    d.fx = null; 
    d.fy = null;
    if (!d3.event.active) {
      simulation.alphaTarget(0);
      simulationLabels.alphaTarget(0);
    }
  }
})
.catch(error => {
    console.log('Failed to load data', error);
    throw error;
});
