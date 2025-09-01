#!/usr/bin/env node

/**
 * Test script for Qoder IDE MCP integration
 * This script verifies that the MCP server can be properly integrated with Qoder IDE
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

/**
 * Test MCP server initialization
 */
async function testMCPServerInitialization() {
    log('\n🔧 Testing MCP Server for Qoder IDE Integration...', colors.bold);
    
    return new Promise((resolve, reject) => {
        const serverPath = path.join(process.cwd(), 'build', 'index.js');
        
        if (!fs.existsSync(serverPath)) {
            logError('Server build not found. Run "npm run build" first.');
            reject(new Error('Server build not found'));
            return;
        }
        
        const server = spawn('node', [serverPath, '--framework', 'react'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let stdout = '';
        let stderr = '';
        let serverReady = false;

        const timeout = setTimeout(() => {
            if (!serverReady) {
                server.kill();
                reject(new Error('Server initialization timeout'));
            }
        }, 10000);

        server.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        server.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            
            // Check for server ready messages
            if (output.includes('Server started successfully')) {
                serverReady = true;
                clearTimeout(timeout);
                server.kill();
                resolve({ stdout, stderr });
            }
        });

        server.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        server.on('close', (code) => {
            clearTimeout(timeout);
            if (serverReady) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Server failed to start. Exit code: ${code}`));
            }
        });
    });
}

/**
 * Test MCP tools availability
 */
async function testMCPToolsAvailability() {
    log('\n🛠️  Testing MCP Tools Availability...', colors.bold);
    
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['build/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let responseReceived = false;

        const timeout = setTimeout(() => {
            if (!responseReceived) {
                server.kill();
                reject(new Error('Tools list request timeout'));
            }
        }, 15000);

        server.stdout.on('data', (data) => {
            const output = data.toString();
            const lines = output.split('\n');
            
            for (const line of lines) {
                if (line.trim() && line.includes('"jsonrpc"')) {
                    try {
                        const response = JSON.parse(line.trim());
                        if (response.result && response.result.tools) {
                            responseReceived = true;
                            clearTimeout(timeout);
                            server.kill();
                            resolve(response.result.tools);
                            return;
                        }
                    } catch (e) {
                        // Continue looking for valid JSON
                    }
                }
            }
        });

        server.stderr.on('data', (data) => {
            // Collect stderr for debugging
        });

        server.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        // Send tools list request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list'
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

/**
 * Validate configuration files
 */
function validateConfigurationFiles() {
    log('\n📋 Validating Configuration Files...', colors.bold);
    
    const configFile = path.join(process.cwd(), 'qoder-mcp-config.json');
    const startupScript = path.join(process.cwd(), 'start-mcp-server.bat');
    
    let configValid = true;
    
    // Check config file
    if (fs.existsSync(configFile)) {
        try {
            const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            if (config.mcpServers && config.mcpServers['shadcn-ui-local']) {
                logSuccess('Qoder MCP configuration file is valid');
            } else {
                logError('Invalid MCP configuration structure');
                configValid = false;
            }
        } catch (error) {
            logError(`Invalid JSON in configuration file: ${error.message}`);
            configValid = false;
        }
    } else {
        logError('Qoder MCP configuration file not found');
        configValid = false;
    }
    
    // Check startup script
    if (fs.existsSync(startupScript)) {
        logSuccess('Startup script found');
    } else {
        logWarning('Startup script not found');
    }
    
    return configValid;
}

/**
 * Main test runner
 */
async function runQoderIntegrationTests() {
    log('🚀 Qoder IDE MCP Integration Test Suite', colors.bold);
    log('==========================================', colors.bold);
    
    let allTestsPassed = true;
    
    try {
        // Test 1: Configuration files
        logInfo('Test 1: Configuration Files Validation');
        const configValid = validateConfigurationFiles();
        if (!configValid) {
            allTestsPassed = false;
        }
        
        // Test 2: Server initialization
        logInfo('Test 2: MCP Server Initialization');
        const { stderr } = await testMCPServerInitialization();
        
        if (stderr.includes('YashTellis/ui')) {
            logSuccess('Server configured for YashTellis/ui repository');
        }
        
        if (stderr.includes('Server started successfully')) {
            logSuccess('MCP Server initializes correctly');
        } else {
            logError('Server initialization issues detected');
            allTestsPassed = false;
        }
        
        // Test 3: Tools availability
        logInfo('Test 3: MCP Tools Availability');
        const tools = await testMCPToolsAvailability();
        
        const expectedTools = [
            'get_component',
            'list_components', 
            'get_component_demo',
            'get_component_metadata',
            'create_component',
            'get_directory_structure',
            'get_block',
            'list_blocks'
        ];
        
        const availableTools = tools.map(tool => tool.name);
        
        for (const expectedTool of expectedTools) {
            if (availableTools.includes(expectedTool)) {
                logSuccess(`Tool '${expectedTool}' is available`);
            } else {
                logError(`Tool '${expectedTool}' is missing`);
                allTestsPassed = false;
            }
        }
        
    } catch (error) {
        logError(`Test failed: ${error.message}`);
        allTestsPassed = false;
    }
    
    // Results
    log('\n📊 Integration Test Results', colors.bold);
    log('============================', colors.bold);
    
    if (allTestsPassed) {
        log('\n🎉 All tests passed! MCP server is ready for Qoder IDE integration!', colors.green + colors.bold);
        log('\nNext steps:', colors.blue);
        log('1. Configure Qoder IDE to use the qoder-mcp-config.json file');
        log('2. Start the MCP server using start-mcp-server.bat');
        log('3. Test the integration in Qoder IDE');
    } else {
        log('\n⚠️  Some tests failed. Please check the issues above.', colors.yellow);
    }
    
    log('\nConfiguration files created:', colors.info);
    log('• qoder-mcp-config.json - MCP server configuration for Qoder IDE');
    log('• start-mcp-server.bat - Startup script for the MCP server');
    log('• test-qoder-integration.js - This test suite');
}

// Run tests
runQoderIntegrationTests().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
});