import financeService from './src/services/finance.service.js';

async function test() {
  try {
    const summary = await financeService.getSummary();
    console.log('Summary:', JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
