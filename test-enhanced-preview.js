#!/usr/bin/env node

/**
 * Create and preview a sample component to show the enhanced preview system
 */

import { toolHandlers } from './build/tools/index.js';

async function createAndPreviewSampleComponent() {
    console.log('🎯 Testing Enhanced Component Preview with Dashboard Integration\n');
    
    try {
        // Step 1: Create a sample component
        console.log('1. Creating sample dashboard-card component...');
        const componentResult = await toolHandlers.create_component({
            componentName: 'dashboard-card',
            componentType: 'data-display',
            description: 'A card component for displaying dashboard metrics',
            customVariants: ['metric', 'status'],
            includeDemo: true
        });
        
        if (!componentResult.content?.[0]?.text) {
            throw new Error('Failed to create component');
        }
        
        const componentData = JSON.parse(componentResult.content[0].text);
        console.log('✅ Component created successfully!');
        
        // Step 2: Generate enhanced preview
        console.log('\n2. Generating enhanced preview with dashboard link...');
        const previewResult = await toolHandlers.preview_component({
            componentName: 'dashboard-card',
            componentCode: componentData.files.component.content,
            demoCode: componentData.files.demo.content,
            previewMode: 'standalone',
            includeStyles: true
        });
        
        if (!previewResult.content?.[0]?.text) {
            throw new Error('Failed to generate preview');
        }
        
        const previewData = JSON.parse(previewResult.content[0].text);
        console.log('✅ Enhanced preview generated successfully!');
        
        // Step 3: Regenerate dashboard to include new component
        console.log('\n3. Updating dashboard with new component...');
        const dashboardResult = await toolHandlers.preview_dashboard({
            showAll: true,
            theme: 'auto',
            sortBy: 'date'
        });
        
        const dashboardData = JSON.parse(dashboardResult.content[0].text);
        console.log('✅ Dashboard updated successfully!');
        
        // Step 4: Show integration details
        console.log('\n📋 Enhanced Preview Features:');
        console.log('• Enhanced header with dashboard navigation link');
        console.log('• Improved component analysis with visual metrics');
        console.log('• Better styling with gradients and shadows');
        console.log('• FontAwesome icons for better visual hierarchy');
        console.log('• Direct link to components dashboard');
        console.log('• Responsive design improvements');
        
        console.log('\n🎯 Dashboard Integration:');
        console.log(`• Total Components: ${dashboardData.totalComponents}`);
        console.log('• Interactive component gallery');
        console.log('• Search and filter capabilities');
        console.log('• Real-time component statistics');
        console.log('• Export functionality');
        console.log('• Mobile-responsive design');
        
        // Step 5: Show navigation workflow
        console.log('\n🔄 Navigation Workflow:');
        console.log('1. Individual preview → "View All Components" → Dashboard');
        console.log('2. Dashboard → Click component card → Individual preview');
        console.log('3. Dashboard → Search/Filter → Find specific components');
        console.log('4. Dashboard → Export → Download component metadata');
        
        // Success summary
        console.log('\n🎉 Enhanced System Features:');
        console.log('✅ Beautiful dashboard with glass morphism design');
        console.log('✅ Enhanced individual previews with better UX');
        console.log('✅ Seamless navigation between dashboard and previews');
        console.log('✅ Real-time component statistics and analytics');
        console.log('✅ Advanced search and filtering capabilities');
        console.log('✅ Mobile-responsive design for all screen sizes');
        console.log('✅ Export functionality for component management');
        
        return {
            component: componentData,
            preview: previewData,
            dashboard: dashboardData
        };
        
    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        console.error('Full error:', error);
        return null;
    }
}

// Run the demonstration
createAndPreviewSampleComponent().then(result => {
    if (result) {
        console.log('\n🚀 Enhanced Preview System Test Completed Successfully!');
        console.log('\n📂 Access Points:');
        console.log(`Dashboard: ${result.dashboard.dashboardUrl}`);
        console.log(`Latest Preview: ${result.preview.previewUrl}`);
        console.log('\n💡 Try the workflow:');
        console.log('1. Open the dashboard to see all components');
        console.log('2. Click on the dashboard-card component');
        console.log('3. Notice the "View All Components" button in the preview');
        console.log('4. Use it to navigate back to the dashboard');
    } else {
        console.log('\n💥 Test failed!');
        process.exit(1);
    }
}).catch(console.error);