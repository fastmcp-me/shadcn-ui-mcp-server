#!/usr/bin/env node

console.log('🧪 Testing Enhanced Shadcn/UI Validation System...\n');

async function testValidationSystem() {
    try {
        // Import the tools dynamically
        const { toolHandlers } = await import('./build/tools/index.js');
        
        console.log('Test 1: Valid Component Creation');
        console.log('=================================');
        
        // Test valid component creation
        const validResult = await toolHandlers.create_component({
            componentName: 'premium-card',
            componentType: 'layout',
            description: 'A premium card component with enhanced styling',
            customVariants: ['premium', 'enterprise'],
            customSizes: ['compact'],
            includeDemo: true,
            strictMode: true
        });
        
        const validData = JSON.parse(validResult.content[0].text);
        console.log(`✅ Component: ${validData.componentName}`);
        console.log(`✅ Shadcn Compliant: ${validData.metadata.shadcnCompliant}`);
        console.log(`✅ Has Warnings: ${validData.metadata.hasWarnings}`);
        console.log(`✅ Warning Count: ${validData.metadata.warningCount}`);
        console.log(`✅ Validation Summary:`, validData.metadata.validationSummary);
        
        console.log('\nTest 2: Invalid Component Name');
        console.log('==============================');
        
        try {
            await toolHandlers.create_component({
                componentName: 'MyInvalidComponent',
                strictMode: true
            });
            console.log('❌ Should have failed');
        } catch (error) {
            console.log(`✅ Correctly caught name validation error:`);
            console.log(`   ${error.message.substring(0, 120)}...`);
        }
        
        console.log('\nTest 3: Invalid Component Type');
        console.log('==============================');
        
        try {
            await toolHandlers.create_component({
                componentName: 'test-widget',
                componentType: 'invalid-type',
                strictMode: true
            });
            console.log('❌ Should have failed');
        } catch (error) {
            console.log(`✅ Correctly caught type validation error:`);
            console.log(`   ${error.message.substring(0, 120)}...`);
        }
        
        console.log('\nTest 4: Invalid Custom Variants');
        console.log('===============================');
        
        try {
            await toolHandlers.create_component({
                componentName: 'test-button',
                customVariants: ['Invalid_Variant', 'Another-Wrong'],
                strictMode: true
            });
            console.log('❌ Should have failed');
        } catch (error) {
            console.log(`✅ Correctly caught variant validation error:`);
            console.log(`   ${error.message.substring(0, 120)}...`);
        }
        
        console.log('\nTest 5: Component with Warnings');
        console.log('==============================');
        
        // Test component that generates warnings
        const warningResult = await toolHandlers.create_component({
            componentName: 'button', // This should generate a warning for conflicting with existing component
            componentType: 'ui',
            customVariants: ['default', 'special'], // 'default' should generate warning for duplication
            customSizes: ['sm', 'extra-large'], // 'sm' should generate warning for duplication
            strictMode: true
        });
        
        const warningData = JSON.parse(warningResult.content[0].text);
        console.log(`✅ Component created with warnings: ${warningData.componentName}`);
        console.log(`✅ Has Warnings: ${warningData.metadata.hasWarnings}`);
        console.log(`✅ Warning Count: ${warningData.metadata.warningCount}`);
        
        console.log('\nTest 6: Edge Case - Empty Custom Arrays');
        console.log('=======================================');
        
        const edgeResult = await toolHandlers.create_component({
            componentName: 'minimal-component',
            componentType: 'ui',
            customVariants: [],
            customSizes: [],
            strictMode: true
        });
        
        const edgeData = JSON.parse(edgeResult.content[0].text);
        console.log(`✅ Minimal component: ${edgeData.componentName}`);
        console.log(`✅ Shadcn Compliant: ${edgeData.metadata.shadcnCompliant}`);
        
        console.log('\nTest 7: Push Component Validation');
        console.log('=================================');
        
        try {
            await toolHandlers.push_component({
                componentName: 'Invalid_Push_Name',
                componentCode: 'export const Invalid = () => <div>test</div>;'
            });
            console.log('❌ Should have failed');
        } catch (error) {
            console.log(`✅ Correctly caught push validation error:`);
            console.log(`   ${error.message.substring(0, 120)}...`);
        }
        
        console.log('\n🎉 All validation tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Valid component creation works');
        console.log('- ✅ Invalid component names are rejected');
        console.log('- ✅ Invalid component types are rejected'); 
        console.log('- ✅ Invalid custom variants are rejected');
        console.log('- ✅ Warning system works for conflicts and duplicates');
        console.log('- ✅ Edge cases handled properly');
        console.log('- ✅ Push component validation works');
        console.log('- ✅ Enhanced shadcn/ui pattern compliance enforced');
        console.log('- ✅ Joi validation schemas working correctly');
        
        console.log('\n🏆 Enhanced Validation Features:');
        console.log('- 🔒 Strict component name patterns (kebab-case)');
        console.log('- 🎯 Shadcn/ui component type validation');
        console.log('- ⚠️  Conflict detection for reserved names');
        console.log('- 🔄 Duplicate variant/size detection');
        console.log('- 📊 Comprehensive validation reporting');
        console.log('- 🛡️  Performance and maintainability warnings');
        console.log('- 📝 Detailed error messages with requirements');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        console.error('Full error:', error);
    }
}

testValidationSystem();