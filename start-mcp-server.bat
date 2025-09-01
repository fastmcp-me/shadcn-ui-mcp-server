@echo off
REM Shadcn UI MCP Server Startup Script for Qoder IDE
REM This script starts the local MCP server with optimal configuration

echo Starting Shadcn UI MCP Server for Qoder IDE...
echo Repository: YashTellis/ui
echo Framework: React
echo ========================================

REM Set environment variables if not already set
if "%GITHUB_PERSONAL_ACCESS_TOKEN%"=="" (
    echo Warning: GITHUB_PERSONAL_ACCESS_TOKEN not set
    echo You'll be limited to 60 requests/hour
    echo To set token: set GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
)

REM Change to server directory
cd /d "c:\Users\yashk\OneDrive\Desktop\Tellis\Server\shadcn-ui-mcp-server"

REM Start the server
node build/index.js --framework react

echo Server stopped.
pause