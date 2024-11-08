import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

const nodeWidth = 150;
const nodeHeight = 50;

const methodColors = {
  GET: '#4CAF50',
  POST: '#FF9800',
  PUT: '#2196F3',
  DELETE: '#F44336',
  PATCH: '#9C27B0',
  DEFAULT: '#607D8B',
};

const OpenAPIGraphComponent = ({ spec }) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState({
    GET: true,
    POST: true,
    PUT: true,
    DELETE: true,
    PATCH: true,
  });

  useEffect(() => {
    if (spec) {
      const { nodes: parsedNodes, edges: parsedEdges } = parseOpenApiSpec(spec);
      const layoutedElements = applyLayout(parsedNodes, parsedEdges);
      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      setLoading(false);
    }
  }, [spec, methodFilter]);

  const parseOpenApiSpec = (spec) => {
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    const paths = spec.paths || {};

    const topLevelPaths = new Set();
    const clusterNodes = {};

    for (const path in paths) {
      const methods = paths[path];
      const pathSegments = path.split('/').filter((segment) => segment !== '');

      const topLevelPath = `/${pathSegments[0] || ''}`;
      topLevelPaths.add(topLevelPath);

      if (!clusterNodes[topLevelPath]) {
        // Create a cluster node for the top-level path
        clusterNodes[topLevelPath] = {
          id: topLevelPath,
          type: 'group',
          position: { x: 0, y: 0 },
          data: { label: topLevelPath },
          style: {
            background: '#f0f0f0',
            border: '1px solid #999',
            padding: 10,
          },
        };
      }

      const fullPathId = path;

      // Create a node for the full path inside the cluster
      nodes.push({
        id: fullPathId,
        parentNode: topLevelPath,
        extent: 'parent',
        data: { label: path },
        style: {
          background: '#BBDEFB',
          color: '#000',
          border: '1px solid #000',
          padding: 10,
          borderRadius: 5,
          width: 140,
        },
      });

      for (const method in methods) {
        if (!methodFilter[method.toUpperCase()]) continue; // Filter methods

        const methodId = `${fullPathId}_${method.toUpperCase()}`;

        nodes.push({
          id: methodId,
          parentNode: fullPathId,
          extent: 'parent',
          data: { label: method.toUpperCase() },
          style: {
            background: methodColors[method.toUpperCase()] || methodColors.DEFAULT,
            color: '#FFF',
            border: '1px solid #000',
            padding: 5,
            borderRadius: 5,
            width: 100,
          },
        });

        edges.push({
          id: `e${fullPathId}-${methodId}`,
          source: fullPathId,
          target: methodId,
          animated: true,
          label: method.toUpperCase(),
          style: { stroke: methodColors[method.toUpperCase()] || methodColors.DEFAULT },
        });
      }
    }

    // Add cluster nodes to the nodes array
    nodes.push(...Object.values(clusterNodes));

    return { nodes, edges };
  };

  const applyLayout = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = false;
    dagreGraph.setGraph({ rankdir: isHorizontal ? 'LR' : 'TB' });

    nodes.forEach((node) => {
      const width = node.style?.width || nodeWidth;
      const height = node.style?.height || nodeHeight;
      dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.position = {
        x: nodeWithPosition.x - (node.style?.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.style?.height || nodeHeight) / 2,
      };
      node.targetPosition = isHorizontal ? 'left' : 'top';
      node.sourcePosition = isHorizontal ? 'right' : 'bottom';

      return node;
    });

    return { nodes, edges };
  };

  const handleMethodFilterChange = (method) => {
    setMethodFilter((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  if (loading) {
    return <div>Loading OpenAPI specification...</div>;
  }

  return (
    <div>
      <h2>OpenAPI Specification Graph</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>Filter by HTTP Methods:</strong>
        {Object.keys(methodFilter).map((method) => (
          <label key={method} style={{ marginLeft: '10px' }}>
            <input
              type="checkbox"
              checked={methodFilter[method]}
              onChange={() => handleMethodFilterChange(method)}
            />
            <span style={{ color: methodColors[method] || methodColors.DEFAULT }}>
              {method}
            </span>
          </label>
        ))}
      </div>
      <div style={{ height: '80vh', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default OpenAPIGraphComponent;
