#!/usr/bin/env node

/**
 * Script to push the red and black button component to the repository
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

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
 * Send MCP request to push the component to the repository
 */
async function pushComponent() {
    // Read the component files
    const componentPath = path.join(process.cwd(), 'red-black-button-corrected.tsx');
    const demoPath = path.join(process.cwd(), 'red-black-button-demo-corrected.tsx');
    
    if (!fs.existsSync(componentPath) || !fs.existsSync(demoPath)) {
        logError('Component files not found. Please run the creation script first.');
        process.exit(1);
    }
    
    const componentCode = fs.readFileSync(componentPath, 'utf8');
    const demoCode = fs.readFileSync(demoPath, 'utf8');

    return new Promise((resolve, reject) => {
        const server = spawn('node', ['build/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: {
                ...process.env,
                GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
            }
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

        // Send the push component request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'push_component',
                arguments: {
                    componentName: 'red-black-button',
                    componentCode: componentCode,
                    demoCode: demoCode,
                    commitMessage: 'Add red-black-button component with red and black styling',
                    branch: 'main',
                    createPullRequest: true,
                    autoMerge: false
                }
            }
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function run() {
    log('📤 Pushing Red & Black Button Component to Repository', colors.bold);
    log('=================================================', colors.bold);
    
    // Check if GitHub token is available
    if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
        logError('GitHub Personal Access Token not found in environment variables.');
        logInfo('Please set GITHUB_PERSONAL_ACCESS_TOKEN in your .env file.');
        process.exit(1);
    }
    
    try {
        logInfo('Starting MCP server and sending push_component request...');
        
        const { response, logs, stdout } = await pushComponent();
        
        // Save logs for debugging
        fs.writeFileSync('mcp-red-black-button-push.log', `STDOUT:\n${stdout}\n\nSTDERR:\n${logs}`);
        
        if (response.result) {
            logSuccess('Component pushed to repository successfully');
            console.log(JSON.stringify(response.result, null, 2));
        } else if (response.error) {
            logError(`Push failed: ${JSON.stringify(response.error, null, 2)}`);
        }
        
    } catch (error) {
        logError(`Failed to push component: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
    
    log('\n🎉 Red & Black Button Component Push Completed!', colors.green + colors.bold);
}

run();