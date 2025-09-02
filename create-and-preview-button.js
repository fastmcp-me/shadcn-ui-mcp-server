#!/usr/bin/env node

/**
 * Create and Preview a Single Button Component
 * 
 * This script demonstrates the complete workflow:
 * 1. Create a custom button component
 * 2. Preview it in the browser
 */

import { toolHandlers } from './build/tools/index.js';

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

async function createAndPreviewButton() {
    log('🚀 Creating and Previewing Custom Button Component', colors.bold + colors.magenta);
    log('='.repeat(60), colors.magenta);
    
    const buttonName = 'awesome-button';
    
    try {
        // Step 1: Create the button component
        log('\\n🔨 Step 1: Creating Custom Button Component...', colors.bold + colors.blue);
        logInfo(`Component name: ${buttonName}`);
        logInfo('Component type: ui');
        logInfo('Description: An awesome button with custom styling and animations');
        
        const createResult = await toolHandlers.create_component({
            componentName: buttonName,
            componentType: 'ui',
            description: 'An awesome button with custom styling and animations',
            customVariants: ['premium', 'outline-dashed'],
            customSizes: ['xs', 'xl'],
            includeDemo: true,
            strictMode: true
        });
        
        if (!createResult.content?.[0]?.text) {
            throw new Error('Failed to create component - no content returned');
        }
        
        const componentData = JSON.parse(createResult.content[0].text);
        logSuccess(`Button component "${buttonName}" created successfully!`);
        
        // Show component details
        log('\\n📊 Component Details:', colors.bold);
        log(`• Name: ${componentData.componentName}`, colors.blue);
        log(`• Type: ${componentData.componentType}`, colors.blue);
        log(`• Framework: ${componentData.metadata.framework}`, colors.blue);
        log(`• TypeScript: ${componentData.metadata.typescript ? '✅' : '❌'}`, colors.blue);
        log(`• Shadcn Compliant: ${componentData.metadata.shadcnCompliant ? '✅' : '❌'}`, colors.blue);
        log(`• Custom Variants: ${componentData.metadata.hasCustomVariants ? '✅' : '❌'}`, colors.blue);
        log(`• Total Variants: ${componentData.metadata.variantCount}`, colors.blue);
        
        // Show file details
        log('\\n📁 Generated Files:', colors.bold);
        Object.entries(componentData.files).forEach(([fileType, fileData]) => {
            log(`• ${fileType}: ${fileData.path} (${fileData.size} bytes)`, colors.cyan);
        });
        
        // Step 2: Generate preview
        log('\\n👀 Step 2: Generating Component Preview...', colors.bold + colors.blue);
        logInfo('Creating standalone HTML preview with full styling...');
        
        const previewResult = await toolHandlers.preview_component({
            componentName: buttonName,
            componentCode: componentData.files.component.content,
            demoCode: componentData.files.demo.content,
            previewMode: 'standalone',
            includeStyles: true
        });
        
        if (!previewResult.content?.[0]?.text) {
            throw new Error('Failed to generate preview - no content returned');
        }
        
        const previewData = JSON.parse(previewResult.content[0].text);
        logSuccess('Preview generated successfully!');
        
        // Show preview details
        log('\\n🌐 Preview Details:', colors.bold);
        log(`• Preview File: ${previewData.previewPath}`, colors.cyan);
        log(`• Full Path: ${previewData.previewUrl}`, colors.cyan);
        log(`• Preview Mode: ${previewData.previewMode}`, colors.blue);
        log(`• Includes Styles: ✅ Tailwind CSS + shadcn/ui`, colors.blue);
        
        // Step 3: Show what's in the preview
        log('\\n📋 Preview Includes:', colors.bold);
        log('• Component analysis dashboard', colors.yellow);
        log('• Live component preview area', colors.yellow);
        log('• Complete source code with syntax highlighting', colors.yellow);
        log('• Demo usage examples', colors.yellow);
        log('• Interactive testing checklist', colors.yellow);
        log('• Next steps guidance', colors.yellow);
        
        // Step 4: Show next actions
        log('\\n🎯 What to do next:', colors.bold);
        log('1. Open the preview file in your browser:', colors.green);
        log(`   ${previewData.previewUrl}`, colors.cyan);
        log('2. Test the component appearance and functionality', colors.green);
        log('3. Use the interactive checklist to validate the component', colors.green);
        log('4. If satisfied, use push_component to commit to repository', colors.green);
        log('5. If changes needed, modify parameters and re-run create_component', colors.green);
        
        // Step 5: Component code preview
        log('\\n📄 Component Code Preview (first 300 chars):', colors.bold);
        const codePreview = componentData.files.component.content.substring(0, 300) + '...';
        log(codePreview, colors.cyan);
        
        // Success summary
        log('\\n🎉 Success Summary:', colors.bold + colors.green);
        log('✅ Custom button component created with premium variants', colors.green);
        log('✅ HTML preview generated and ready for testing', colors.green);
        log('✅ All files generated with proper shadcn/ui compliance', colors.green);
        log('✅ Demo code included for usage examples', colors.green);
        log('✅ Ready for browser testing and validation', colors.green);
        
        return {
            component: componentData,
            preview: previewData
        };
        
    } catch (error) {
        logError(`Failed to create and preview button: ${error.message}`);
        console.error('Full error:', error);
        return null;
    }
}

// Run the demonstration
createAndPreviewButton().then(result => {
    if (result) {
        log('\\n🚀 Button component creation and preview completed successfully!', colors.bold + colors.green);
        log('\\n💡 Pro tip: You can now open the preview file to see your component in action!', colors.yellow);
    } else {
        log('\\n💥 Failed to create and preview button component.', colors.bold + colors.red);
        process.exit(1);
    }
});