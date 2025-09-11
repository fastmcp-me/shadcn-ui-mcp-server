#!/usr/bin/env node

/**
 * Script to list all available components using the MCP server
 */

import { spawn } from 'child_process';
import fs from 'fs';

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
 * Send MCP request to list all components
 */
async function listComponents() {
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
        }, 30000);

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
                        resolve({ response, logs: stderr, stdout });
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

        // Send the list components request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function run() {
    log('📋 Listing All Available Components', colors.bold);
    log('=================================', colors.bold);
    
    try {
        logInfo('Starting MCP server and sending list request...');
        
        const { response, logs, stdout } = await listComponents();
        
        // Save logs for debugging
        fs.writeFileSync('mcp-list-components.log', `STDOUT:\n${stdout}\n\nSTDERR:\n${logs}`);
        
        if (response.result) {
            logSuccess('Components list retrieved successfully');
            
            // Parse and display the components
            if (response.result.content && response.result.content[0]) {
                const content = response.result.content[0].text;
                const components = JSON.parse(content);
                
                if (components.components && Array.isArray(components.components)) {
                    logInfo(`Found ${components.components.length} components:`);
                    components.components.forEach((component, index) => {
                        console.log(`  ${index + 1}. ${component}`);
                    });
                } else {
                    console.log(components);
                }
            } else {
                console.log(JSON.stringify(response.result, null, 2));
            }
            
        } else if (response.error) {
            logError(`List components failed: ${JSON.stringify(response.error, null, 2)}`);
        }
        
    } catch (error) {
        logError(`Failed to list components: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
    
    log('\n🎉 Component List Retrieval Completed!', colors.green + colors.bold);
}

run();