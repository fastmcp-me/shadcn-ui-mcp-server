// Generic Component Retrieval Script
const { createServer } = require('./build/server');

async function getComponent(componentName) {
  console.log(`Retrieving component: ${componentName}`);
  
  // Initialize the MCP server
  const server = createServer();
  
  try {
    // Use the get_component tool
    const result = await server.callTool('get_component', {
      name: componentName
    });
    
    console.log(`${componentName} component retrieved successfully!`);
    console.log('Component details:', result);
    
    return result;
  } catch (error) {
    console.error(`Error retrieving ${componentName} component:`, error);
    return null;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('Please provide a component name as an argument');
    process.exit(1);
  }
  
  getComponent(componentName).then(result => {
    if (result) {
      console.log(`✅ ${componentName} retrieval completed!`);
    } else {
      console.log(`❌ ${componentName} retrieval failed!`);
      process.exit(1);
    }
  });
}

module.exports = { getComponent };