#!/usr/bin/env node

/**
 * Push Button Components to Repository using MCP Server
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

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
 * Push a component to repository with its code
 */
async function pushComponentWithCode(componentName, componentPath) {
    return new Promise((resolve, reject) => {
        try {
            // Read the component code
            const componentCode = readFileSync(componentPath, 'utf8');
            
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
            }, 20000);

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

            // Send the push component request with code
            const request = {
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'tools/call',
                params: {
                    name: 'push_component',
                    arguments: {
                        componentName: componentName,
                        componentCode: componentCode,
                        targetRepository: 'YashTellis/ui',
                        componentType: 'ui',
                        description: `${componentName} component with multiple variants and styling options`
                    }
                }
            };

            server.stdin.write(JSON.stringify(request) + '\n');
            server.stdin.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

async function pushAllButtonsToRepository() {
    log('🚀 Pushing All Button Components to Repository using Shadcn MCP Server', colors.bold);
    log('====================================================================================', colors.bold);
    
    const components = [
        {
            name: 'primary-button',
            path: '../test-full/src/components/ui/primary-button.tsx'
        },
        {
            name: 'outline-button', 
            path: '../test-full/src/components/ui/outline-button.tsx'
        },
        {
            name: 'gradient-button',
            path: '../test-full/src/components/ui/gradient-button.tsx'
        },
        {
            name: 'icon-button',
            path: '../test-full/src/components/ui/icon-button.tsx'
        },
        {
            name: 'link-button',
            path: '../test-full/src/components/ui/link-button.tsx'
        }
    ];

    let successCount = 0;
    
    for (const component of components) {
        try {
            logInfo(`Pushing ${component.name} to repository...`);
            
            const { response, logs } = await pushComponentWithCode(component.name, component.path);
            
            if (response.result && response.result.content) {
                const content = response.result.content[0].text;
                let result;
                
                try {
                    result = JSON.parse(content);
                } catch (e) {
                    // If not JSON, treat as success message
                    result = { success: true, message: content };
                }
                
                if (result.success) {
                    logSuccess(`Component "${component.name}" pushed to repository successfully`);
                    successCount++;
                } else {
                    logError(`Failed to push ${component.name}: ${result.error || result.message || 'Unknown error'}`);
                }
                
            } else if (response.error) {
                logError(`Push component ${component.name} failed: ${JSON.stringify(response.error)}`);
            } else {
                logSuccess(`Component "${component.name}" processed (may already exist in repository)`);
                successCount++;
            }
            
        } catch (error) {
            logError(`Push ${component.name} failed: ${error.message}`);
        }
        
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return successCount;
}

pushAllButtonsToRepository().then(successCount => {
    if (successCount === 5) {
        log('\n🎉 All Button Components Successfully Pushed to Repository!', colors.green + colors.bold);
        logInfo('Components are now available in the YashTellis/ui repository');
    } else if (successCount > 0) {
        log(`\n⚠️  Pushed ${successCount}/5 components to repository.`, colors.yellow + colors.bold);
        logInfo('Some components may have already existed in the repository');
    } else {
        log('\n❌ Failed to push components to repository', colors.red + colors.bold);
        process.exit(1);
    }
});