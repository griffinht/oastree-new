// CustomNode.jsx
import React from 'react';
import { Handle } from 'reactflow';
import { Tooltip } from 'react-tooltip';

const CustomNode = ({ id, data }) => {
  const { label, tooltip, collapsed, onToggleCollapse, hasChildren, schema } = data;

  return (
    <div className="custom-node" data-tooltip-id={`tooltip-${id}`}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>{label}</div>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(data.id);
            }}
            style={{ marginLeft: 'auto' }}
          >
            {collapsed ? '+' : '-'}
          </button>
        )}
      </div>
      {schema && (
        <div className="schema-properties">
          {Object.entries(schema.properties || {}).map(([key, value]) => (
            <div key={key}>
              <strong>{key}</strong>: {value.type || 'unknown'}
            </div>
          ))}
        </div>
      )}
      {/* Adjusted handles for horizontal layout */}
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />

      {/* Updated Tooltip implementation */}
      <Tooltip id={`tooltip-${id}`} place="top">
        <span style={{ whiteSpace: 'pre-line' }}>{tooltip}</span>
      </Tooltip>
    </div>
  );
};

export default CustomNode;
