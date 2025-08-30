#!/usr/bin/env node

/**
 * Test script for the create_component endpoint
 */

import { spawn } from 'child_process';

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

/**
 * Send MCP request to test create_component
 */
async function testCreateComponent() {
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['build/index.js'], {
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
                reject(new Error('Request timed out'));
            }
        }, 15000);

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

        // Send the create component request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'create_component',
                arguments: {
                    componentName: 'my-special-widget',
                    componentType: 'ui',
                    baseComponent: 'button',
                    description: 'A special widget component for testing',
                    includeDemo: true
                }
            }
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function runTest() {
    log('🧪 Testing Create Component Endpoint', colors.bold);
    log('===================================', colors.bold);
    
    try {
        logInfo('Testing create_component tool...');
        
        const { response, logs } = await testCreateComponent();
        
        // Check if logs show YashTellis/ui repository
        if (logs.includes('YashTellis/ui')) {
            logSuccess('Server is configured to use YashTellis/ui repository');
        }
        
        if (response.result && response.result.content) {
            logSuccess('Create component tool executed successfully');
            
            const content = response.result.content[0].text;
            const result = JSON.parse(content);
            
            if (result.success) {
                logSuccess(`Component "${result.componentName}" generated successfully`);
                logInfo(`Component type: ${result.componentType}`);
                logInfo(`Files generated: ${Object.keys(result.files).join(', ')}`);
                
                // Show component file preview
                if (result.files.component) {
                    logInfo(`Component file: ${result.files.component.path}`);
                    logInfo(`Component size: ${result.files.component.size} characters`);
                    
                    // Show first few lines of generated component
                    const componentLines = result.files.component.content.split('\n').slice(0, 5);
                    logInfo('Generated component preview:');
                    componentLines.forEach(line => console.log(`  ${line}`));
                }
                
                // Show demo file if generated
                if (result.files.demo) {
                    logInfo(`Demo file: ${result.files.demo.path}`);
                    logInfo(`Demo size: ${result.files.demo.size} characters`);
                }
                
                // Show instructions
                logInfo('Instructions:');
                result.instructions.forEach(instruction => console.log(`  • ${instruction}`));
                
            } else {
                logError('Component generation failed');
                logInfo(`Response: ${content.substring(0, 300)}...`);
            }
            
        } else if (response.error) {
            logError(`Create component failed: ${JSON.stringify(response.error)}`);
        }
        
    } catch (error) {
        logError(`Test failed: ${error.message}`);
        process.exit(1);
    }
    
    log('\n🎉 Create Component Test Completed!', colors.green + colors.bold);
}

runTest();