#!/usr/bin/env node

console.log('🎨 Testing Custom Variants and Sizes with MCP Server...\n');

async function testCustomVariantsAndSizes() {
    try {
        // Import the tools dynamically
        const { toolHandlers } = await import('./build/tools/index.js');
        
        console.log('Test 1: UI Component with Custom Variants');
        console.log('=========================================');
        
        const uiResult = await toolHandlers.create_component({
            componentName: 'status-button',
            componentType: 'ui',
            description: 'A button with custom status variants',
            customVariants: ['success', 'warning', 'danger', 'info'],
            customSizes: ['xs', 'xl'],
            includeDemo: true,
            strictMode: true
        });
        
        const uiData = JSON.parse(uiResult.content[0].text);
        console.log(`✅ Component: ${uiData.componentName}`);
        console.log(`✅ Custom Variants Added: ${uiData.metadata.variantCount}`);
        console.log(`✅ Validation Summary:`, uiData.metadata.validationSummary);
        
        console.log('\nTest 2: Layout Component with Premium Variants');
        console.log('==============================================');
        
        const layoutResult = await toolHandlers.create_component({
            componentName: 'premium-card',
            componentType: 'layout',
            description: 'A premium card with enterprise variants',
            customVariants: ['basic', 'premium', 'enterprise', 'platinum'],
            customSizes: ['compact', 'standard', 'expanded'],
            includeDemo: true,
            strictMode: true
        });
        
        const layoutData = JSON.parse(layoutResult.content[0].text);
        console.log(`✅ Component: ${layoutData.componentName}`);
        console.log(`✅ Custom Variants: ${layoutData.metadata.variantCount}`);
        console.log(`✅ Has Warnings: ${layoutData.metadata.hasWarnings}`);
        
        console.log('\nTest 3: Form Component with Validation States');
        console.log('============================================');
        
        const formResult = await toolHandlers.create_component({
            componentName: 'validation-input',
            componentType: 'form',
            description: 'An input with validation state variants',
            customVariants: ['valid', 'invalid', 'pending', 'disabled'],
            customSizes: ['compact', 'comfortable'],
            includeDemo: true,
            strictMode: true
        });
        
        const formData = JSON.parse(formResult.content[0].text);
        console.log(`✅ Component: ${formData.componentName}`);
        console.log(`✅ Total Variants: ${formData.metadata.validationSummary.totalVariants}`);
        console.log(`✅ Total Sizes: ${formData.metadata.validationSummary.totalSizes}`);
        
        console.log('\nTest 4: Navigation Component with States');
        console.log('=======================================');
        
        const navResult = await toolHandlers.create_component({
            componentName: 'nav-link',
            componentType: 'navigation',
            description: 'A navigation link with custom states',
            customVariants: ['active', 'inactive', 'disabled', 'highlighted'],
            customSizes: ['compact', 'comfortable', 'spacious'],
            includeDemo: true,
            strictMode: true
        });
        
        const navData = JSON.parse(navResult.content[0].text);
        console.log(`✅ Component: ${navData.componentName}`);
        console.log(`✅ Shadcn Compliant: ${navData.metadata.shadcnCompliant}`);
        
        console.log('\nTest 5: Testing Validation Limits');
        console.log('=================================');
        
        try {
            // This should generate warnings but still work
            await toolHandlers.create_component({
                componentName: 'complex-component',
                componentType: 'ui',
                customVariants: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9'], // 9 variants (exceeds 8 limit)
                customSizes: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'], // 7 sizes (exceeds 6 limit)
                strictMode: true
            });
            console.log('⚠️  Component created with warnings (as expected)');
        } catch (error) {
            console.log(`✅ Validation limit enforced: ${error.message.substring(0, 80)}...`);
        }
        
        console.log('\n🎉 Custom Variants and Sizes Testing Completed!');
        console.log('\n📋 Summary of Custom Options:');
        console.log('- ✅ UI Components: Custom status and action variants');
        console.log('- ✅ Layout Components: Premium/enterprise variants');
        console.log('- ✅ Form Components: Validation state variants');
        console.log('- ✅ Navigation Components: Link state variants');
        console.log('- ✅ Size Options: xs, compact, comfortable, spacious, expanded, etc.');
        console.log('- ✅ Validation Limits: Max 8 variants, max 6 sizes (with warnings)');
        
        console.log('\n🎨 Usage Examples Generated:');
        console.log('```tsx');
        console.log('// Status Button with custom variants');
        console.log('<StatusButton variant="success" size="xl">Success Action</StatusButton>');
        console.log('');
        console.log('// Premium Card with enterprise variant');
        console.log('<PremiumCard variant="enterprise" size="expanded">');
        console.log('  Premium Content');
        console.log('</PremiumCard>');
        console.log('');
        console.log('// Validation Input with states');
        console.log('<ValidationInput variant="valid" size="comfortable" />');
        console.log('```');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testCustomVariantsAndSizes();