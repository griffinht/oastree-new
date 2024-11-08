import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';

function App() {
  const [apiSpec, setApiSpec] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  useEffect(() => {
    fetch('/openapi.yaml')
      .then(response => response.text())
      .then(text => {
        const spec = yaml.load(text);
        setApiSpec(spec);
      })
      .catch(error => console.error('Error loading API spec:', error));
  }, []);

  if (!apiSpec) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {apiSpec.info.title} - v{apiSpec.info.version}
        </h1>
        
        {/* API Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-600">{apiSpec.info.description}</p>
        </div>

        {/* Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tags/Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
            <ul className="space-y-2">
              {apiSpec.tags.map(tag => (
                <li key={tag.name} className="hover:bg-gray-50 p-2 rounded">
                  <h3 className="font-medium text-blue-600">{tag.name}</h3>
                  <p className="text-sm text-gray-600">{tag.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            <div className="prose max-w-none">
              <p>Select an endpoint from the left to see its documentation.</p>
              
              {/* Server Information */}
              <div className="mt-4">
                <h3 className="text-lg font-medium">Server URLs</h3>
                <ul className="mt-2 space-y-2">
                  {apiSpec.servers.map((server, index) => (
                    <li key={index} className="bg-gray-50 p-2 rounded">
                      <code className="text-sm">{server.url}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
