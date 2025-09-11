#!/usr/bin/env node

/**
 * Quick test to verify all MCP tools are working
 */

import { tools, toolHandlers } from './build/tools/index.js';

async function quickTest() {
    console.log('🔧 Quick MCP Tools Test\n');
    
    // List all available tools
    console.log('📋 Available Tools:');
    Object.keys(tools).forEach((toolName, index) => {
        console.log(`${index + 1}. ${toolName}`);
    });
    
    console.log('\n🧪 Testing Tool Handlers...\n');
    
    // Test 1: List Components
    try {
        console.log('1. Testing list_components...');
        const result = await toolHandlers.list_components({});
        console.log(`✅ Success: Found ${result.content?.[0]?.text?.split(',').length || 0} components`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
    
    // Test 2: Get Component (button)
    try {
        console.log('2. Testing get_component (button)...');
        const result = await toolHandlers.get_component({ componentName: 'button' });
        console.log(`✅ Success: Button component size: ${result.content?.[0]?.text?.length || 0} chars`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
    
    // Test 3: Create Component
    try {
        console.log('3. Testing create_component...');
        const result = await toolHandlers.create_component({
            componentName: 'test-widget',
            componentType: 'ui',
            description: 'A test widget component'
        });
        console.log(`✅ Success: Created component with ${result.content?.[0]?.text?.length || 0} chars`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
    
    // Test 4: List Blocks
    try {
        console.log('4. Testing list_blocks...');
        const result = await toolHandlers.list_blocks({});
        console.log(`✅ Success: Listed blocks`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
    
    // Test 5: Get Directory Structure
    try {
        console.log('5. Testing get_directory_structure...');
        const result = await toolHandlers.get_directory_structure({});
        console.log(`✅ Success: Got directory structure`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('\n🎉 Quick test completed!');
}

quickTest().catch(console.error);