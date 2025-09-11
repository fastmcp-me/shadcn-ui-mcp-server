#!/usr/bin/env node

/**
 * Generic Component Retrieval Script (ES Module version)
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
 * Send MCP request to get a component
 */
async function getComponent(componentName) {
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

        // Send the get component request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'get_component',
                arguments: {
                    name: componentName
                }
            }
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function run() {
    const componentName = process.argv[2];
    if (!componentName) {
        logError('Please provide a component name as an argument');
        process.exit(1);
    }

    log(`🔍 Retrieving component: ${componentName}`, colors.bold);
    log('===================================', colors.bold);
    
    try {
        logInfo('Starting MCP server and sending get_component request...');
        
        const { response, logs } = await getComponent(componentName);
        
        if (response.result && response.result.content) {
            logSuccess(`${componentName} component retrieved successfully!`);
            
            const content = response.result.content[0].text;
            const result = JSON.parse(content);
            
            if (result.success) {
                logSuccess(`Component "${result.componentName}" retrieved successfully`);
                console.log(`Component content preview:`);
                console.log(result.content.substring(0, 500) + '...');
            } else {
                logError('Component retrieval failed');
                console.log(result);
            }
            
        } else if (response.error) {
            logError(`Get component failed: ${JSON.stringify(response.error)}`);
        }
        
    } catch (error) {
        logError(`Failed to retrieve component: ${error.message}`);
        process.exit(1);
    }
    
    log(`\n🎉 ${componentName} Component Retrieval Completed!`, colors.green + colors.bold);
}

run();