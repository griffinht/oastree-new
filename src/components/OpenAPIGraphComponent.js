import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
// If your OpenAPI spec is in YAML format, uncomment the next line
// import yaml from 'js-yaml';

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
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setLoading(false);
    }
  }, [spec]);

  const parseOpenApiSpec = (spec) => {
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    const paths = spec.paths || {};

    let nodeIdCounter = 0;

    const getNodeId = (path) => {
      if (!nodeIds.has(path)) {
        nodeIds.add(path);
        nodeIdCounter += 1;
      }
      return path;
    };

    for (const path in paths) {
      const methods = paths[path];
      const pathSegments = path.split('/').filter((segment) => segment !== '');

      let parentPath = '';
      pathSegments.forEach((segment, index) => {
        const isParameter = segment.startsWith('{') && segment.endsWith('}');
        const currentPath = parentPath + '/' + segment;

        if (!nodeIds.has(currentPath)) {
          nodes.push({
            id: currentPath,
            position: { x: Math.random() * 600, y: Math.random() * 600 },
            data: {
              label: segment,
            },
            style: {
              background: isParameter ? '#E1BEE7' : '#BBDEFB',
              color: '#000',
              border: '1px solid #000',
              padding: 10,
              borderRadius: 5,
            },
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
          position: { x: Math.random() * 600, y: Math.random() * 600 },
          data: {
            label: method.toUpperCase(),
          },
          style: {
            background: methodColors[method.toUpperCase()] || methodColors.DEFAULT,
            color: '#FFF',
            border: '1px solid #000',
            padding: 10,
            borderRadius: 5,
          },
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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return <div>Loading OpenAPI specification...</div>;
  }

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default OpenAPIGraphComponent;
