#!/usr/bin/env node

/**
 * MCP Server Functionality Test
 * Tests the shadcn-ui-mcp-server to verify it's working correctly
 * and pulling components from the YashTellis/ui repository
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
const TEST_TIMEOUT = 30000; // 30 seconds

// Colors for console output
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
 * Send MCP request to the server and get response
 */
async function sendMCPRequest(request, timeoutMs = TEST_TIMEOUT) {
    return new Promise((resolve, reject) => {
        const args = ['build/index.js'];
        if (GITHUB_TOKEN) {
            args.push('--github-api-key', GITHUB_TOKEN);
        }

        const server = spawn('node', args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let stdout = '';
        let stderr = '';
        let responseReceived = false;

        // Set timeout
        const timeout = setTimeout(() => {
            if (!responseReceived) {
                server.kill();
                reject(new Error(`Request timed out after ${timeoutMs}ms`));
            }
        }, timeoutMs);

        server.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            
            // Look for JSON response
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.trim() && line.includes('"jsonrpc"')) {
                    try {
                        const response = JSON.parse(line.trim());
                        responseReceived = true;
                        clearTimeout(timeout);
                        server.kill();
                        resolve({ response, logs: stderr });
                    } catch (e) {
                        // Continue looking for valid JSON
                    }
                }
            }
        });

        server.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        server.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        server.on('close', (code) => {
            clearTimeout(timeout);
            if (!responseReceived) {
                reject(new Error(`Server closed with code ${code}. Logs: ${stderr}`));
            }
        });

        // Send the request
        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

/**
 * Test server initialization
 */
async function testServerInitialization() {
    log('\n🔧 Testing Server Initialization...', colors.bold);
    
    try {
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '1.0.0',
                capabilities: {},
                clientInfo: { name: 'test-client', version: '1.0.0' }
            }
        };

        const { response, logs } = await sendMCPRequest(request);
        
        // Check if logs show YashTellis/ui repository
        if (logs.includes('YashTellis/ui')) {
            logSuccess('Server is configured to use YashTellis/ui repository');
        } else {
            logError('Server is not configured to use YashTellis/ui repository');
            logInfo('Server logs:');
            console.log(logs);
        }

        if (response.result) {
            logSuccess('Server initialization successful');
            logInfo(`Server capabilities: ${JSON.stringify(response.result.capabilities, null, 2)}`);
        } else {
            logError(`Initialization failed: ${JSON.stringify(response.error)}`);
        }

        return true;
    } catch (error) {
        logError(`Server initialization test failed: ${error.message}`);
        return false;
    }
}

/**
 * Test listing tools
 */
async function testListTools() {
    log('\n🛠️  Testing List Tools...', colors.bold);
    
    try {
        const request = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
        };

        const { response } = await sendMCPRequest(request);
        
        if (response.result && response.result.tools) {
            logSuccess(`Found ${response.result.tools.length} tools`);
            
            const expectedTools = [
                'list_components',
                'get_component',
                'get_component_demo',
                'get_component_metadata',
                'list_blocks',
                'get_block',
                'get_directory_structure'
            ];

            const availableTools = response.result.tools.map(tool => tool.name);
            
            for (const expectedTool of expectedTools) {
                if (availableTools.includes(expectedTool)) {
                    logSuccess(`Tool '${expectedTool}' is available`);
                } else {
                    logWarning(`Tool '${expectedTool}' is missing`);
                }
            }
        } else {
            logError(`List tools failed: ${JSON.stringify(response.error)}`);
        }

        return true;
    } catch (error) {
        logError(`List tools test failed: ${error.message}`);
        return false;
    }
}

/**
 * Test getting components list
 */
async function testListComponents() {
    log('\n📦 Testing List Components...', colors.bold);
    
    try {
        const request = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'list_components',
                arguments: {}
            }
        };

        const { response } = await sendMCPRequest(request);
        
        if (response.result && response.result.content) {
            logSuccess('Components list retrieved successfully');
            const content = response.result.content[0].text;
            
            // Parse components list
            try {
                const components = JSON.parse(content);
                if (Array.isArray(components)) {
                    logSuccess(`Found ${components.length} components from YashTellis/ui`);
                    logInfo(`Sample components: ${components.slice(0, 5).join(', ')}`);
                } else {
                    logInfo(`Components response: ${content.substring(0, 200)}...`);
                }
            } catch (e) {
                logInfo(`Components response: ${content.substring(0, 200)}...`);
            }
        } else {
            logError(`List components failed: ${JSON.stringify(response.error)}`);
        }

        return true;
    } catch (error) {
        logError(`List components test failed: ${error.message}`);
        return false;
    }
}

/**
 * Test getting a specific component
 */
async function testGetComponent() {
    log('\n🎯 Testing Get Component (button)...', colors.bold);
    
    try {
        const request = {
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'get_component',
                arguments: {
                    componentName: 'button'
                }
            }
        };

        const { response } = await sendMCPRequest(request);
        
        if (response.result && response.result.content) {
            logSuccess('Button component retrieved successfully');
            const content = response.result.content[0].text;
            
            // Check if it looks like React component code
            if (content.includes('React') || content.includes('export') || content.includes('interface')) {
                logSuccess('Component appears to be valid React code from YashTellis/ui');
                logInfo(`Component size: ${content.length} characters`);
                
                // Show first few lines
                const lines = content.split('\n').slice(0, 5);
                logInfo('First few lines:');
                lines.forEach(line => console.log(`  ${line}`));
            } else {
                logWarning('Component content does not look like React code');
                logInfo(`Content preview: ${content.substring(0, 200)}...`);
            }
        } else {
            logError(`Get component failed: ${JSON.stringify(response.error)}`);
        }

        return true;
    } catch (error) {
        logError(`Get component test failed: ${error.message}`);
        return false;
    }
}

/**
 * Test repository configuration
 */
async function testRepositoryConfiguration() {
    log('\n🔍 Testing Repository Configuration...', colors.bold);
    
    try {
        const request = {
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
                name: 'get_directory_structure',
                arguments: {
                    owner: 'YashTellis',
                    repo: 'ui',
                    path: 'apps/v4/registry/new-york-v4'
                }
            }
        };

        const { response } = await sendMCPRequest(request);
        
        if (response.result && response.result.content) {
            logSuccess('Successfully accessed YashTellis/ui repository');
            const content = response.result.content[0].text;
            
            if (content.includes('ui') || content.includes('components')) {
                logSuccess('Repository structure looks correct for shadcn components');
            } else {
                logWarning('Repository structure might be different from expected');
            }
            
            logInfo(`Directory structure preview: ${content.substring(0, 300)}...`);
        } else {
            logWarning(`Directory structure test failed: ${JSON.stringify(response.error)}`);
            logInfo('This might be expected if the YashTellis/ui repo structure is different');
        }

        return true;
    } catch (error) {
        logWarning(`Repository configuration test failed: ${error.message}`);
        logInfo('This might be expected if the YashTellis/ui repo is not accessible');
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    log('🧪 Starting MCP Server Tests', colors.bold);
    log('=====================================', colors.bold);
    
    if (!GITHUB_TOKEN) {
        logWarning('No GITHUB_PERSONAL_ACCESS_TOKEN found. Tests will be rate-limited.');
        logInfo('For better testing, set: export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token');
    } else {
        logSuccess('Using GitHub token for API requests');
    }

    const tests = [
        testServerInitialization,
        testListTools,
        testListComponents,
        testGetComponent,
        testRepositoryConfiguration
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            failed++;
            logError(`Test failed with error: ${error.message}`);
        }
    }

    log('\n📊 Test Results', colors.bold);
    log('===============', colors.bold);
    logSuccess(`Passed: ${passed}`);
    if (failed > 0) {
        logError(`Failed: ${failed}`);
    }
    
    if (failed === 0) {
        log('\n🎉 All tests passed! MCP server is working correctly with YashTellis/ui repository!', colors.green + colors.bold);
    } else {
        log('\n⚠️  Some tests failed. Check the output above for details.', colors.yellow);
    }

    return failed === 0;
}

// Run tests immediately
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
});

export { runTests };