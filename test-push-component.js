#!/usr/bin/env node

/**
 * Test script for push-component functionality
 * 
 * This script tests the new push_component tool without actually pushing to GitHub.
 * It validates the tool registration and parameter handling.
 */

import { tools, toolHandlers } from '../src/tools/index.js';

async function testPushComponentTool() {
    console.log('🧪 Testing push-component functionality...\n');

    // Test 1: Check tool registration
    console.log('1. Testing tool registration...');
    const pushTool = tools['push_component'];
    if (!pushTool) {
        console.error('❌ push_component tool not found in tools registry');
        return false;
    }
    console.log('✅ push_component tool found in registry');
    console.log(`   Name: ${pushTool.name}`);
    console.log(`   Description: ${pushTool.description}`);
    console.log(`   Required params: ${pushTool.inputSchema.required?.join(', ')}`);

    // Test 2: Check handler registration
    console.log('\n2. Testing handler registration...');
    const pushHandler = toolHandlers['push_component'];
    if (!pushHandler) {
        console.error('❌ push_component handler not found');
        return false;
    }
    console.log('✅ push_component handler found');
    console.log(`   Handler type: ${typeof pushHandler}`);

    // Test 3: Test parameter validation (dry run)
    console.log('\n3. Testing parameter validation...');
    try {
        // Test with missing required parameters
        console.log('   Testing missing componentName...');
        try {
            await pushHandler({
                componentCode: 'test code'
            });
            console.error('❌ Should have failed with missing componentName');
            return false;
        } catch (error) {
            if (error.message.includes('componentName')) {
                console.log('   ✅ Correctly validates missing componentName');
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}`);
            }
        }

        // Test with missing required parameters
        console.log('   Testing missing componentCode...');
        try {
            await pushHandler({
                componentName: 'test-component'
            });
            console.error('❌ Should have failed with missing componentCode');
            return false;
        } catch (error) {
            if (error.message.includes('componentCode') || error.message.includes('required')) {
                console.log('   ✅ Correctly validates missing componentCode');
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}`);
            }
        }

        // Test with invalid component name
        console.log('   Testing invalid componentName...');
        try {
            await pushHandler({
                componentName: 'Invalid_Component_Name',
                componentCode: 'test code'
            });
            console.error('❌ Should have failed with invalid componentName');
            return false;
        } catch (error) {
            if (error.message.includes('Invalid component name')) {
                console.log('   ✅ Correctly validates invalid componentName');
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}`);
            }
        }

    } catch (error) {
        console.error(`❌ Unexpected error during validation tests: ${error.message}`);
        return false;
    }

    // Test 4: Framework-specific functionality
    console.log('\n4. Testing framework detection...');
    try {
        // Import framework utility
        const { getFramework, getFrameworkInfo } = await import('../src/utils/framework.js');
        const currentFramework = getFramework();
        const frameworkInfo = getFrameworkInfo();
        
        console.log(`   Current framework: ${currentFramework}`);
        console.log(`   Repository: ${frameworkInfo.repository}`);
        console.log(`   File extension: ${frameworkInfo.fileExtension}`);
        console.log('   ✅ Framework detection working');
    } catch (error) {
        console.error(`❌ Framework detection failed: ${error.message}`);
        return false;
    }

    // Test 5: Schema validation
    console.log('\n5. Testing schema structure...');
    const schema = pushTool.inputSchema;
    const requiredFields = ['componentName', 'componentCode'];
    const optionalFields = ['demoCode', 'commitMessage', 'branch', 'createPullRequest'];
    
    for (const field of requiredFields) {
        if (!schema.required?.includes(field)) {
            console.error(`❌ Required field ${field} not in schema.required`);
            return false;
        }
        if (!schema.properties[field]) {
            console.error(`❌ Required field ${field} not in schema.properties`);
            return false;
        }
    }
    console.log('   ✅ All required fields present in schema');

    for (const field of optionalFields) {
        if (!schema.properties[field]) {
            console.error(`❌ Optional field ${field} not in schema.properties`);
            return false;
        }
    }
    console.log('   ✅ All optional fields present in schema');

    console.log('\n🎉 All tests passed! Push component functionality is ready.');
    console.log('\n📝 To test with actual GitHub push:');
    console.log('   1. Set GITHUB_PERSONAL_ACCESS_TOKEN environment variable');
    console.log('   2. Ensure you have write access to the target repository');
    console.log('   3. Use the MCP client to call push_component with real component code');
    
    return true;
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testPushComponentTool()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('🚨 Test script failed:', error);
            process.exit(1);
        });
}

export { testPushComponentTool };