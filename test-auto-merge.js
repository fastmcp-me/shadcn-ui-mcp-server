#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set GitHub token from environment variable
// Make sure to set GITHUB_PERSONAL_ACCESS_TOKEN environment variable
if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    console.error('❌ Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required');
    console.log('Please set your GitHub token: set GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here');
    process.exit(1);
}

console.log('🚀 Creating and auto-merging a badge component...\n');

async function main() {
    try {
        // Import the tools dynamically
        const { toolHandlers } = await import('./build/tools/index.js');
        
        console.log('Step 1: Creating the badge component...');
        
        // Create the badge component
        const createResult = await toolHandlers.create_component({
            componentName: 'auto-badge',
            componentType: 'ui',
            baseComponent: 'badge',
            description: 'A badge component with auto-merge functionality',
            includeDemo: true
        });
        
        console.log('✅ Component created successfully!');
        
        // Parse the creation result to get the component code
        const componentData = JSON.parse(createResult.content[0].text);
        const componentCode = componentData.files.component.content;
        const demoCode = componentData.files.demo ? componentData.files.demo.content : undefined;
        
        console.log('\nStep 2: Pushing component to repository with auto-merge...');
        
        // Push the component to the repository with auto-merge enabled
        const pushResult = await toolHandlers.push_component({
            componentName: 'auto-badge',
            componentCode: componentCode,
            demoCode: demoCode,
            commitMessage: 'Add auto-badge component with auto-merge functionality',
            createPullRequest: true,
            autoMerge: true
        });
        
        console.log('✅ Component pushed with auto-merge successfully!');
        console.log('Push result:', JSON.stringify(pushResult.content[0].text, null, 2));
        
        console.log('\n🎉 Badge component creation and auto-merge completed successfully!');
        
        // Parse the result to show auto-merge status
        const result = JSON.parse(pushResult.content[0].text);
        if (result.pullRequest) {
            if (result.pullRequest.autoMerged) {
                console.log('\n✅ AUTO-MERGE SUCCESS: Pull request was automatically merged!');
                console.log(`🔗 View the merged changes: ${result.pullRequest.url}`);
            } else {
                console.log('\n⚠️  AUTO-MERGE FAILED: Pull request created but not merged automatically');
                if (result.pullRequest.autoMergeError) {
                    console.log(`❌ Error: ${result.pullRequest.autoMergeError}`);
                }
                console.log(`🔗 Manual review required: ${result.pullRequest.url}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        
        console.log('\nTroubleshooting:');
        console.log('1. Make sure the MCP server is built: npm run build');
        console.log('2. Check that the GitHub token has write and merge permissions');
        console.log('3. Verify that the repository allows auto-merge');
        console.log('4. Check if branch protection rules allow auto-merge');
    }
}

main();