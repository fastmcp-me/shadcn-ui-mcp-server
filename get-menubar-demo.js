// Menubar Demo Retrieval Script
const { createServer } = require('./build/server');

async function getMenubarDemo() {
  console.log('Retrieving menubar demo...');
  
  // Initialize the MCP server
  const server = createServer();
  
  try {
    // Use the get_component_demo tool
    const result = await server.callTool('get_component_demo', {
      componentName: 'menubar'
    });
    
    console.log('Menubar demo retrieved successfully!');
    console.log('Demo code:', result);
    
    return result;
  } catch (error) {
    console.error('Error retrieving menubar demo:', error);
    return null;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  getMenubarDemo().then(result => {
    if (result) {
      console.log('✅ Menubar demo retrieval completed!');
    } else {
      console.log('❌ Menubar demo retrieval failed!');
      process.exit(1);
    }
  });
}

module.exports = { getMenubarDemo };