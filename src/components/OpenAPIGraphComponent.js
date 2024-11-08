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

// Initialize dagre graph
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Define node dimensions
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spec) {
      const { nodes: parsedNodes, edges: parsedEdges } = parseOpenApiSpec(spec);
      const layoutedElements = getLayoutedElements(parsedNodes, parsedEdges);
      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      setLoading(false);
    }
  }, [spec]);

  const parseOpenApiSpec = (spec) => {
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    const paths = spec.paths || {};

    for (const path in paths) {
      const methods = paths[path];
      const pathSegments = path.split('/').filter((segment) => segment !== '');

      let parentPath = '';
      pathSegments.forEach((segment) => {
        const isParameter = segment.startsWith('{') && segment.endsWith('}');
        const currentPath = parentPath + '/' + segment;

        if (!nodeIds.has(currentPath)) {
          nodes.push({
            id: currentPath,
            data: {
              label: segment,
            },
            style: {
              background: isParameter ? '#E1BEE7' : '#BBDEFB',
              color: '#000',
              border: '1px solid #000',
              padding: 10,
              borderRadius: 5,
              width: nodeWidth,
            },
            position: { x: 0, y: 0 }, // Position will be set by dagre
          });
          nodeIds.add(currentPath);

          if (parentPath) {
            edges.push({
              id: `e${parentPath}-${currentPath}`,
              source: parentPath,
              target: currentPath,
              animated: false,
              style: { stroke: '#999' },
            });
          }
        }

        parentPath = currentPath;
      });

      const fullPathNodeId = parentPath;

      for (const method in methods) {
        const methodId = `${fullPathNodeId}_${method.toUpperCase()}`;
        nodes.push({
          id: methodId,
          data: {
            label: method.toUpperCase(),
          },
          style: {
            background: methodColors[method.toUpperCase()] || methodColors.DEFAULT,
            color: '#FFF',
            border: '1px solid #000',
            padding: 10,
            borderRadius: 5,
            width: nodeWidth,
          },
          position: { x: 0, y: 0 }, // Position will be set by dagre
        });

        edges.push({
          id: `e${fullPathNodeId}-${methodId}`,
          source: fullPathNodeId,
          target: methodId,
          animated: true,
          label: method.toUpperCase(),
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#FFF', color: '#000', fillOpacity: 0.7 },
          style: { stroke: methodColors[method.toUpperCase()] || methodColors.DEFAULT },
        });
      }
    }

    return { nodes, edges };
  };

  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? 'left' : 'top';
      node.sourcePosition = isHorizontal ? 'right' : 'bottom';

      // Shift dagre's coordinate system (origin at top-left) to React Flow's (origin at center)
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    });

    return { nodes, edges };
  };

  if (loading) {
    return <div>Loading OpenAPI specification...</div>;
  }

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={true}
        panOnScroll={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default OpenAPIGraphComponent;
