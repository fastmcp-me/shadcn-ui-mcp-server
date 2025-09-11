# Qoder IDE MCP Integration Guide

This guide explains how to integrate your local Shadcn UI MCP Server with Qoder IDE.

## 🎯 Overview

This MCP server provides AI-powered access to your custom UI component library (`YashTellis/ui`) with the following capabilities:

- **Component Retrieval**: Get source code from your repository
- **Component Creation**: Generate new components following existing patterns  
- **Component Discovery**: List and explore available components
- **Demo Access**: Get usage examples and demos
- **Metadata Access**: Retrieve component dependencies and descriptions
- **Repository Browsing**: Explore directory structures
- **Block Management**: Access complete UI block implementations

## 🚀 Integration Steps

### Step 1: Configure Qoder IDE

1. **Open Qoder IDE Settings**
   - Go to Settings > Extensions > MCP Servers
   - Or access through the command palette: `Ctrl+Shift+P` → "MCP: Configure Servers"

2. **Add MCP Server Configuration**
   - Click "Add Server" or "Import Configuration"
   - Use the configuration file: `qoder-mcp-config.json`
   - Or manually add the server with these settings:

   ```json
   {
     "name": "Shadcn UI Local Server",
     "command": "node",
     "args": ["build/index.js", "--framework", "react"],
     "cwd": "c:\\Users\\yashk\\OneDrive\\Desktop\\Tellis\\Server\\shadcn-ui-mcp-server",
     "env": {
       "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
     }
   }
   ```

### Step 2: Set Up GitHub Token (Recommended)

1. **Create GitHub Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select scope: `public_repo` (for public repositories)
   - Copy the token (starts with `ghp_`)

2. **Configure Token**:
   - **Option A**: Update `qoder-mcp-config.json` with your token
   - **Option B**: Set environment variable:
     ```cmd
     set GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
     ```

### Step 3: Start the MCP Server

- **Method 1**: Use the startup script
  ```cmd
  start-mcp-server.bat
  ```

- **Method 2**: Manual start
  ```cmd
  cd "c:\Users\yashk\OneDrive\Desktop\Tellis\Server\shadcn-ui-mcp-server"
  node build/index.js --framework react
  ```

### Step 4: Test Integration in Qoder IDE

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run MCP Commands**:
   - `MCP: List Components` - See available components from YashTellis/ui
   - `MCP: Get Component` - Retrieve component source code
   - `MCP: Create Component` - Generate new components
   - `MCP: List Tools` - See all available MCP tools

## 🛠️ Available MCP Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `get_component` | Get React component source code | Retrieves .tsx files from YashTellis/ui |
| `list_components` | List all available components | Shows components in your repository |
| `get_component_demo` | Get component demos | Shows usage examples |
| `get_component_metadata` | Get component metadata | Dependencies, descriptions, etc. |
| `create_component` | Create new components | Generates components following patterns |
| `get_directory_structure` | Browse repository | Explore YashTellis/ui structure |
| `get_block` | Get UI block implementations | Complete dashboard/form blocks |
| `list_blocks` | List available blocks | Shows available UI blocks |

## 💡 Usage Examples

### Example 1: Get a Component
```
Ask AI: "Get the button component from my UI library"   
→ MCP calls: get_component(componentName: "button")
→ Returns: React component source from YashTellis/ui
```

### Example 2: Create a New Component
```
Ask AI: "Create a custom notification component"
→ MCP calls: create_component(
    componentName: "notification",
    componentType: "feedback", 
    description: "A custom notification component"
  )
→ Returns: Generated component following your patterns
```

### Example 3: List Available Components
```
Ask AI: "What UI components are available?"
→ MCP calls: list_components()
→ Returns: All components from YashTellis/ui repository
```

## 🔧 Configuration Details

### Server Configuration
- **Repository**: YashTellis/ui (your custom component library)
- **Framework**: React (TypeScript/TSX)
- **Path**: `apps/v4/registry/new-york-v4/ui/`
- **Branch**: main

### File Locations
- **Server Executable**: `build/index.js`
- **Configuration**: `qoder-mcp-config.json`
- **Startup Script**: `start-mcp-server.bat`
- **Test Suite**: `test-qoder-integration.js`

## 🐛 Troubleshooting

### Server Won't Start
1. **Check Node.js version**: Requires Node.js ≥18.0.0
2. **Verify build**: Run `npm run build`
3. **Check paths**: Ensure working directory is correct

### GitHub API Issues
1. **Rate Limits**: Set GITHUB_PERSONAL_ACCESS_TOKEN
2. **Repository Access**: Ensure token has `public_repo` scope
3. **Network**: Check internet connection

### Qoder IDE Integration Issues
1. **Check MCP Server Status**: Look for connection indicators
2. **Restart Server**: Use startup script or manual restart
3. **Check Logs**: Review Qoder IDE output panel

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Rate limit exceeded" | No GitHub token | Set GITHUB_PERSONAL_ACCESS_TOKEN |
| "Server not responding" | Server not running | Run start-mcp-server.bat |
| "Component not found" | Invalid component name | Check available components first |

## 🎯 Best Practices

1. **Use GitHub Token**: Always set up a token for better API limits
2. **Keep Server Running**: Leave MCP server running while using Qoder IDE
3. **Update Components**: Pull latest changes from YashTellis/ui regularly
4. **Monitor Logs**: Check server output for any issues

## 📋 Verification Checklist

- [ ] MCP server builds successfully (`npm run build`)
- [ ] Server starts without errors
- [ ] GitHub token is configured (optional but recommended)
- [ ] Qoder IDE recognizes the MCP server
- [ ] Can list components from YashTellis/ui
- [ ] Can retrieve component source code
- [ ] Can create new components
- [ ] Server shows "Repository: YashTellis/ui" on startup

## 📞 Support

If you encounter issues:

1. **Run the test suite**: `node test-qoder-integration.js`
2. **Check server logs**: Look for error messages
3. **Verify configuration**: Ensure paths and tokens are correct
4. **Restart services**: Restart both MCP server and Qoder IDE

Your local MCP server is now ready to enhance your development workflow in Qoder IDE! 🚀