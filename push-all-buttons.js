#!/usr/bin/env node

/**
 * Push All Button Components to test-full project using MCP Server
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
 * Push a component to repository
 */
async function pushComponent(componentName) {
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['build/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let stdout = '';
        let stderr = '';
        let responseReceived = false;

        const timeout = setTimeout(() => {
            if (!responseReceived) {
                server.kill();
                reject(new Error('Request timed out'));
            }
        }, 15000);

        server.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            
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

        // Send the push component request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'push_component',
                arguments: {
                    componentName: componentName,
                    targetProject: 'test-full',
                    targetPath: 'src/components/ui'
                }
            }
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function pushAllButtonComponents() {
    log('🚀 Pushing All Button Components to test-full project using Shadcn MCP Server', colors.bold);
    log('===================================================================================', colors.bold);
    
    const components = [
        'primary-button',
        'outline-button', 
        'gradient-button',
        'icon-button',
        'link-button'
    ];

    let successCount = 0;
    
    for (const componentName of components) {
        try {
            logInfo(`Pushing ${componentName} to test-full project...`);
            
            const { response, logs } = await pushComponent(componentName);
            
            if (response.result && response.result.content) {
                const content = response.result.content[0].text;
                const result = JSON.parse(content);
                
                if (result.success) {
                    logSuccess(`Component "${componentName}" pushed successfully`);
                    successCount++;
                } else {
                    logError(`Failed to push ${componentName}: ${result.error || 'Unknown error'}`);
                }
                
            } else if (response.error) {
                logError(`Push component ${componentName} failed: ${JSON.stringify(response.error)}`);
            }
            
        } catch (error) {
            logError(`Push ${componentName} failed: ${error.message}`);
        }
    }
    
    return successCount;
}

pushAllButtonComponents().then(successCount => {
    if (successCount === 5) {
        log('\n🎉 All Button Components Pushed Successfully to test-full project!', colors.green + colors.bold);
        logInfo('Components are now available in test-full/src/components/ui/');
    } else {
        log(`\n⚠️  Pushed ${successCount}/5 components. Some components may already exist in the target location.`, colors.yellow + colors.bold);
    }
});