// Menubar Component Retrieval Script
const { createServer } = require('./build/server');

async function getMenubar() {
  console.log('Retrieving menubar component...');
  
  // Initialize the MCP server
  const server = createServer();
  
  try {
    // Use the get_component tool
    const result = await server.callTool('get_component', {
      name: 'menubar'
    });
    
    console.log('Menubar component retrieved successfully!');
    console.log('Component details:', result);
    
    return result;
  } catch (error) {
    console.error('Error retrieving menubar component:', error);
    return null;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  getMenubar().then(result => {
    if (result) {
      console.log('✅ Menubar retrieval completed!');
    } else {
      console.log('❌ Menubar retrieval failed!');
      process.exit(1);
    }
  });
}

module.exports = { getMenubar };