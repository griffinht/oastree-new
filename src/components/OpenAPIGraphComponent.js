// OpenAPIGraphComponent.jsx
import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import CustomNode from './CustomNode';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 60;

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
  const [collapsedNodes, setCollapsedNodes] = useState({});

  useEffect(() => {
    if (spec) {
      const { nodes: parsedNodes, edges: parsedEdges } = parseOpenApiSpec(spec);
      const layoutedElements = getLayoutedElements(parsedNodes, parsedEdges, 'LR'); // Left-to-Right layout
      const visibleElements = getVisibleElements(
        layoutedElements.nodes,
        layoutedElements.edges
      );
      setNodes(visibleElements.nodes);
      setEdges(visibleElements.edges);
      setLoading(false);
    }
  }, [spec, collapsedNodes]);

  const onToggleCollapse = useCallback((nodeId) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }, []);

  const onNodeClick = useCallback((event, node) => {
    // For future use if you want to handle node clicks
    console.log('Node clicked:', node);
  }, []);

  const parseOpenApiSpec = (spec) => {
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();
    const schemaNodeIds = new Set();

    const paths = spec.paths || {};
    const schemas = spec.components?.schemas || {};

    for (const path in paths) {
      const methods = paths[path];
      const pathSegments = path.split('/').filter(Boolean);

      let parentPath = '';
      pathSegments.forEach((segment, index) => {
        const isParameter = segment.startsWith('{') && segment.endsWith('}');
        const currentPath = parentPath + '/' + segment;

        if (!nodeIds.has(currentPath)) {
          nodes.push({
            id: currentPath,
            data: {
              id: currentPath,
              label: '/' + segment,
              tooltip: `Path: ${currentPath}`,
              type: 'path',
              collapsed: collapsedNodes[currentPath] ?? index > 0,
              onToggleCollapse,
              hasChildren: false,
            },
            style: {
              background: isParameter ? '#E1BEE7' : '#BBDEFB',
            },
            position: { x: 0, y: 0 },
            type: 'customNode',
          });
          nodeIds.add(currentPath);
        }

        if (parentPath) {
          edges.push({
            id: `e${parentPath}-${currentPath}`,
            source: parentPath,
            target: currentPath,
            style: { stroke: '#999' },
          });
        }

        parentPath = currentPath;
      });

      const fullPathNodeId = parentPath;

      for (const method in methods) {
        const operation = methods[method];
        const methodId = `${fullPathNodeId}_${method.toUpperCase()}`;

        // Tooltip content
        const summary = operation.summary || '';
        const description = operation.description || '';
        const parameters = operation.parameters || [];

        nodes.push({
          id: methodId,
          data: {
            id: methodId,
            label: method.toUpperCase(),
            tooltip: `Method: ${method.toUpperCase()}\n${summary}\n${description}`,
            type: 'method',
          },
          style: {
            background: methodColors[method.toUpperCase()] || methodColors.DEFAULT,
            color: '#FFF',
          },
          position: { x: 0, y: 0 },
          type: 'customNode',
        });

        edges.push({
          id: `e${fullPathNodeId}-${methodId}`,
          source: fullPathNodeId,
          target: methodId,
          label: method.toUpperCase(),
          style: { stroke: methodColors[method.toUpperCase()] || methodColors.DEFAULT },
        });

        // Handle requestBody schemas
        if (operation.requestBody) {
          const content = operation.requestBody.content;
          if (content) {
            for (const mediaType in content) {
              const schemaRef = content[mediaType]?.schema?.$ref;
              if (schemaRef) {
                const schemaName = schemaRef.split('/').pop();

                // Add schema node
                if (!schemaNodeIds.has(schemaName)) {
                  const schema = schemas[schemaName];
                  nodes.push({
                    id: `schema_${schemaName}`,
                    data: {
                      id: `schema_${schemaName}`,
                      label: schemaName,
                      tooltip: `Schema: ${schemaName}\n${getSchemaProperties(schema)}`,
                      type: 'schema',
                      schema: schema,
                    },
                    style: {
                      background: '#FFD54F',
                    },
                    position: { x: 0, y: 0 },
                    type: 'customNode',
                  });
                  schemaNodeIds.add(schemaName);
                }

                // Connect method node to schema node
                edges.push({
                  id: `e${methodId}-schema_${schemaName}`,
                  source: methodId,
                  target: `schema_${schemaName}`,
                  label: 'Request Body',
                  style: { stroke: '#FFB74D' },
                });
              }
            }
          }
        }

        // Handle response schemas
        if (operation.responses) {
          for (const statusCode in operation.responses) {
            const response = operation.responses[statusCode];
            const content = response.content;
            if (content) {
              for (const mediaType in content) {
                const schemaRef = content[mediaType]?.schema?.$ref;
                if (schemaRef) {
                  const schemaName = schemaRef.split('/').pop();

                  if (!schemaNodeIds.has(schemaName)) {
                    const schema = schemas[schemaName];
                    nodes.push({
                      id: `schema_${schemaName}`,
                      data: {
                        id: `schema_${schemaName}`,
                        label: schemaName,
                        tooltip: `Schema: ${schemaName}\n${getSchemaProperties(schema)}`,
                        type: 'schema',
                        schema: schema,
                      },
                      style: {
                        background: '#FFD54F',
                      },
                      position: { x: 0, y: 0 },
                      type: 'customNode',
                    });
                    schemaNodeIds.add(schemaName);
                  }

                  // Connect method node to schema node
                  edges.push({
                    id: `e${methodId}-schema_${schemaName}-resp-${statusCode}`,
                    source: methodId,
                    target: `schema_${schemaName}`,
                    label: `Response ${statusCode}`,
                    style: { stroke: '#64B5F6' },
                  });
                }
              }
            }
          }
        }
      }
    }

    // Update hasChildren property
    nodes.forEach((node) => {
      const hasChildren = nodes.some(
        (childNode) =>
          childNode.id.startsWith(`${node.id}/`) && childNode.id !== node.id
      );
      node.data.hasChildren = hasChildren;
    });

    return { nodes, edges };
  };

  const getSchemaProperties = (schema) => {
    if (!schema.properties) {
      return 'No properties';
    }
    return (
      'Properties:\n' +
      Object.keys(schema.properties)
        .map((prop) => `- ${prop}: ${schema.properties[prop].type || 'unknown'}`)
        .join('\n')
    );
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

      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    });

    return { nodes, edges };
  };

  const isNodeHidden = (nodeId) => {
    if (collapsedNodes[nodeId]) {
      return true;
    }

    const parentIds = getParentIds(nodeId);
    for (const parentId of parentIds) {
      if (collapsedNodes[parentId]) {
        return true;
      }
    }

    return false;
  };

  const getParentIds = (nodeId) => {
    const pathSegments = nodeId.split('/');
    const parentIds = [];
    for (let i = pathSegments.length - 1; i > 1; i--) {
      const parentId = pathSegments.slice(0, i).join('/');
      parentIds.push(parentId);
    }
    return parentIds;
  };

  const getVisibleElements = (nodes, edges) => {
    const visibleNodeIds = new Set();

    nodes.forEach((node) => {
      if (!isNodeHidden(node.id)) {
        visibleNodeIds.add(node.id);
      }
    });

    const visibleNodes = nodes.filter((node) => visibleNodeIds.has(node.id));

    const visibleEdges = edges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return { nodes: visibleNodes, edges: visibleEdges };
  };

  const nodeTypes = {
    customNode: CustomNode,
  };

  if (loading) {
    return <div>Loading OpenAPI specification...</div>;
  }

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodesDraggable={false}
        fitView
        panOnScroll
        selectionOnDrag
        elementsSelectable
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default OpenAPIGraphComponent;
