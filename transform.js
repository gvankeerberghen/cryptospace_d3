const data = require('./data/crypto.json');
const fs = require('fs');
const { get, map, pick } = require('lodash/fp');

data.nodes = map(
  d => ({
    id: d.id,
    label: d.label,
    group: get(`attributes['node type']`, d)
  })
  ,
  data.nodes
)

data.links = map(
  d => ({
    source: d.source,
    target: d.target,
    value: d.size
  })
  ,
  data.edges
)

fs.writeFile('./data/transformed.json', JSON.stringify(pick(['nodes', 'links'], data), null, 2), 'utf8');
