#!/usr/bin/env node

console.log('🔍 Inspecting Generated Component with Custom Variants...\n');

async function inspectGeneratedComponent() {
    try {
        const { toolHandlers } = await import('./build/tools/index.js');
        
        const result = await toolHandlers.create_component({
            componentName: 'alert-badge',
            componentType: 'feedback',
            description: 'An alert badge with custom severity levels',
            customVariants: ['info', 'warning', 'error', 'critical'],
            customSizes: ['compact', 'comfortable'],
            includeDemo: true,
            strictMode: true
        });
        
        const componentData = JSON.parse(result.content[0].text);
        
        console.log('📋 Generated Component Code:');
        console.log('============================');
        console.log(componentData.files.component.content);
        
        console.log('\n📋 Generated Demo Code:');
        console.log('=======================');
        console.log(componentData.files.demo.content);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

inspectGeneratedComponent();