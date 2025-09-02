#!/usr/bin/env node

/**
 * Script to create a card component using the MCP server
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
 * Send MCP request to create a card component
 */
async function createCardComponent() {
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

        // Send the create component request for a card
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'create_component',
                arguments: {
                    componentName: 'card',
                    componentType: 'ui',
                    baseComponent: 'card',
                    description: 'A card component for displaying content with header, body, and footer sections',
                    includeDemo: true,
                    customVariants: ['default', 'outlined', 'elevated'],
                    customSizes: ['sm', 'default', 'lg']
                }
            }
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

async function run() {
    log('🃏 Creating Card Component using MCP Server', colors.bold);
    log('=========================================', colors.bold);
    
    try {
        logInfo('Starting MCP server and sending create_component request...');
        
        const { response, logs, stdout } = await createCardComponent();
        
        // Save logs for debugging
        fs.writeFileSync('mcp-card-creation.log', `STDOUT:\n${stdout}\n\nSTDERR:\n${logs}`);
        
        if (response.result && response.result.content) {
            logSuccess('Card component creation tool executed successfully');
            
            const content = response.result.content[0].text;
            const result = JSON.parse(content);
            
            if (result.success) {
                logSuccess(`Component "${result.componentName}" generated successfully`);
                logInfo(`Component type: ${result.componentType}`);
                logInfo(`Files generated: ${Object.keys(result.files).join(', ')}`);
                
                // Create directories if they don't exist
                const directories = [
                    'generated-components/ui',
                    'generated-components/types',
                    'generated-components/examples'
                ];
                
                directories.forEach(dir => {
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                });
                
                // Save component file
                if (result.files.component) {
                    const componentPath = `generated-components/ui/${result.componentName}.tsx`;
                    fs.writeFileSync(componentPath, result.files.component.content);
                    logSuccess(`Component file saved: ${componentPath}`);
                }
                
                // Save types file
                if (result.files.interface) {
                    const typesPath = `generated-components/types/${result.componentName}-types.ts`;
                    fs.writeFileSync(typesPath, result.files.interface.content);
                    logSuccess(`Types file saved: ${typesPath}`);
                }
                
                // Save demo file if generated
                if (result.files.demo) {
                    const demoPath = `generated-components/examples/${result.componentName}-demo.tsx`;
                    fs.writeFileSync(demoPath, result.files.demo.content);
                    logSuccess(`Demo file saved: ${demoPath}`);
                }
                
                // Show instructions
                logInfo('Instructions:');
                result.instructions.forEach((instruction, index) => {
                    console.log(`  ${index + 1}. ${instruction}`);
                });
                
                // Show compliance info
                if (result.shadcnPatterns) {
                    logInfo('Shadcn/ui compliance features:');
                    Object.entries(result.shadcnPatterns).forEach(([feature, enabled]) => {
                        if (enabled) {
                            logSuccess(`  ✅ ${feature}`);
                        } else {
                            logError(`  ❌ ${feature}`);
                        }
                    });
                }
                
            } else {
                logError('Component generation failed');
                logInfo(`Response: ${content.substring(0, 300)}...`);
            }
            
        } else if (response.error) {
            logError(`Create component failed: ${JSON.stringify(response.error, null, 2)}`);
        }
        
    } catch (error) {
        logError(`Card creation failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
    
    log('\n🎉 Card Component Creation Completed!', colors.green + colors.bold);
}

run();