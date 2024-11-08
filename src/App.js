import React from 'react';
import yaml from 'js-yaml';
import OpenAPIGraphComponent from './components/OpenAPIGraphComponent';

function App() {
  const [apiSpec, setApiSpec] = React.useState(null);

  React.useEffect(() => {
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
        <OpenAPIGraphComponent spec={apiSpec} />
      </div>
    </div>
  );
}

export default App;
