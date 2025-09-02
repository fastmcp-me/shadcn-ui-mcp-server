// Menubar Component Creation Script
const { createServer } = require('./build/server');

async function createMenubar() {
  console.log('Creating menubar component...');
  
  // Initialize the MCP server
  const server = createServer();
  
  try {
    // Use the create_component tool
    const result = await server.callTool('create_component', {
      componentName: 'menubar',
      componentType: 'ui',
      description: 'A responsive menubar component with dropdown menus'
    });
    
    console.log('Menubar component created successfully!');
    console.log('Component details:', result);
    
    return result;
  } catch (error) {
    console.error('Error creating menubar component:', error);
    return null;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createMenubar().then(result => {
    if (result) {
      console.log('✅ Menubar creation completed!');
    } else {
      console.log('❌ Menubar creation failed!');
      process.exit(1);
    }
  });
}

module.exports = { createMenubar };