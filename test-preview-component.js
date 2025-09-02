#!/usr/bin/env node

/**
 * Test script for the new preview-component functionality
 * 
 * This script demonstrates how to create a component and then preview it
 * before pushing to the repository.
 */

import { tools, toolHandlers } from './build/tools/index.js';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
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

async function testComponentPreview() {
    log('🧪 Testing Component Preview Functionality', colors.bold + colors.cyan);
    log('='.repeat(50), colors.cyan);

    try {
        // Step 1: Create a sample component
        logInfo('Step 1: Creating a sample component...');
        
        const createResult = await toolHandlers.create_component({
            componentName: 'preview-test-button',
            componentType: 'ui',
            description: 'A test button component for preview functionality',
            customVariants: ['danger', 'success'],
            customSizes: ['xs', 'xl'],
            includeDemo: true
        });

        if (!createResult.content?.[0]?.text) {
            throw new Error('Failed to create component - no content returned');
        }

        const componentData = JSON.parse(createResult.content[0].text);
        logSuccess(`Component "${componentData.componentName}" created successfully`);
        
        // Debug: Check the structure of componentData
        logInfo('Component data structure:');
        console.log(JSON.stringify(componentData, null, 2).substring(0, 500) + '...');
        
        // Extract component and demo code correctly
        let componentCode, demoCode;
        if (componentData.files && typeof componentData.files === 'object') {
            componentCode = componentData.files.component?.content;
            demoCode = componentData.files.demo?.content;
        } else {
            throw new Error('Component files not found in expected format');
        }
        
        if (!componentCode) {
            throw new Error('Component code not found in response');
        }
        
        // Step 2: Preview the component
        logInfo('Step 2: Generating component preview...');
        
        const previewResult = await toolHandlers.preview_component({
            componentName: componentData.componentName,
            componentCode: componentCode,
            demoCode: demoCode,
            previewMode: 'standalone',
            includeStyles: true
        });

        if (!previewResult.content?.[0]?.text) {
            throw new Error('Failed to generate preview - no content returned');
        }

        const previewData = JSON.parse(previewResult.content[0].text);
        logSuccess(`Preview generated successfully!`);
        
        // Display preview information
        log('\n📋 Preview Details:', colors.bold);
        log(`• Component Name: ${previewData.componentName}`, colors.blue);
        log(`• Preview Mode: ${previewData.previewMode}`, colors.blue);
        log(`• Preview File: ${previewData.previewPath}`, colors.blue);
        log(`• Preview URL: ${previewData.previewUrl}`, colors.blue);
        
        // Show instructions
        log('\n📖 Instructions:', colors.bold);
        previewData.instructions.forEach((instruction, index) => {
            if (instruction.startsWith('✅') || instruction.startsWith('🔄')) {
                log(`   ${instruction}`, colors.green);
            } else if (instruction.includes('://')) {
                log(`   ${instruction}`, colors.cyan);
            } else if (instruction.trim() === '') {
                console.log('');
            } else {
                log(`   ${instruction}`, colors.reset);
            }
        });

        // Step 3: Test different preview modes
        logInfo('Step 3: Testing different preview modes...');
        
        const modes = ['inline', 'storybook'];
        for (const mode of modes) {
            try {
                const modeResult = await toolHandlers.preview_component({
                    componentName: `preview-test-${mode}`,
                    componentCode: componentCode,
                    previewMode: mode,
                    includeStyles: false
                });
                
                const modeData = JSON.parse(modeResult.content[0].text);
                logSuccess(`${mode} mode preview generated: ${modeData.previewPath}`);
            } catch (error) {
                logWarning(`${mode} mode failed: ${error.message}`);
            }
        }

        // Step 4: Test validation
        logInfo('Step 4: Testing validation...');
        
        try {
            await toolHandlers.preview_component({
                componentName: 'Invalid_Name',
                componentCode: 'short'
            });
            logError('Validation should have failed but didn\'t!');
        } catch (error) {
            logSuccess('Validation correctly rejected invalid input');
        }

        log('\n🎉 Component Preview Test Completed Successfully!', colors.bold + colors.green);
        log('\n💡 What you can do now:', colors.bold);
        log('1. Open the generated preview files in your browser', colors.yellow);
        log('2. Test the component interactivity and appearance', colors.yellow);
        log('3. If satisfied, use push_component to commit to repository', colors.yellow);
        log('4. If changes needed, modify and re-run create_component', colors.yellow);

        return true;

    } catch (error) {
        logError(`Test failed: ${error.message}`);
        console.error('Full error:', error);
        return false;
    }
}

// Test tool availability
async function testToolAvailability() {
    log('\n🔧 Testing Tool Availability...', colors.bold);
    
    const expectedTools = [
        'create_component',
        'preview_component',
        'push_component',
        'list_components',
        'get_component'
    ];

    for (const toolName of expectedTools) {
        if (tools[toolName] && toolHandlers[toolName]) {
            logSuccess(`${toolName} tool is available`);
        } else {
            logError(`${toolName} tool is missing!`);
            return false;
        }
    }
    
    return true;
}

// Main function
async function main() {
    log('🚀 Component Preview System Test', colors.bold + colors.magenta);
    log('='.repeat(50), colors.magenta);
    
    // Test tool availability first
    const toolsAvailable = await testToolAvailability();
    if (!toolsAvailable) {
        logError('Required tools are not available. Exiting.');
        process.exit(1);
    }
    
    // Run the main test
    const success = await testComponentPreview();
    
    if (success) {
        log('\n🎯 All tests passed! Preview system is working correctly.', colors.bold + colors.green);
        process.exit(0);
    } else {
        log('\n💥 Tests failed. Check the output above for details.', colors.bold + colors.red);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logError(`Uncaught exception: ${error.message}`);
    console.error(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled rejection at ${promise}: ${reason}`);
    process.exit(1);
});

// Run the test
main();