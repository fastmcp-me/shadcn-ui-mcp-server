#!/usr/bin/env node

/**
 * Test script to create and push a button component
 * This script demonstrates the create_component and push_component functionality
 */

import { toolHandlers } from './build/tools/index.js';

async function createAndPushButtonComponent() {
    console.log('🚀 Creating and pushing a single button component...\n');

    try {
        // Step 1: Create the button component
        console.log('Step 1: Creating button component...');
        const createResult = await toolHandlers.create_component({
            componentName: 'single-button',
            componentType: 'ui',
            baseComponent: 'button',
            description: 'A clean and simple single button component with modern styling',
            includeDemo: true
        });

        console.log('✅ Component created successfully');
        
        // Parse the created component result
        const componentData = JSON.parse(createResult.content[0].text);
        console.log(`📁 Component file: ${componentData.files.component.path}`);
        console.log(`📄 Demo file: ${componentData.files.demo?.path || 'None'}`);

        // Step 2: Push the component to the repository
        console.log('\nStep 2: Pushing component to repository...');
        const pushResult = await toolHandlers.push_component({
            componentName: 'single-button',
            componentCode: componentData.files.component.content,
            demoCode: componentData.files.demo?.content,
            commitMessage: 'feat: add single-button component with modern styling',
            createPullRequest: true
        });

        console.log('✅ Component pushed successfully');
        
        // Parse the push result
        const pushData = JSON.parse(pushResult.content[0].text);
        console.log('\n🎉 Push Summary:');
        console.log(`Repository: ${pushData.repository}`);
        console.log(`Branch: ${pushData.branch}`);
        console.log(`Commit SHA: ${pushData.commitSha}`);
        
        if (pushData.pullRequest) {
            console.log(`Pull Request: ${pushData.pullRequest.url}`);
            console.log(`PR Number: #${pushData.pullRequest.number}`);
        }

        console.log('\n📋 Files pushed:');
        pushData.files.forEach(file => {
            console.log(`  - ${file.path} (${file.size} bytes)`);
        });

        console.log('\n✨ Success! Your single button component has been created and pushed to the repository.');
        console.log('You can now review the pull request and merge it when ready.');

        return pushData;

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Make sure GITHUB_PERSONAL_ACCESS_TOKEN is set');
        console.error('2. Verify your token has "Contents: Write" permission');
        console.error('3. Check if you have access to the target repository');
        throw error;
    }
}

// Run the test if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAndPushButtonComponent()
        .then(result => {
            console.log('\n🎯 Task completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Task failed:', error);
            process.exit(1);
        });
}

export { createAndPushButtonComponent };