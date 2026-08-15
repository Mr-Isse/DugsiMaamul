/**
 * Test Error Handling System
 * Use this to verify error handling is working
 */

import { getErrorMessage } from '../utils/errorMessageMapper';

// Test cases
const testCases = [
  {
    technical: 'Invalid credentials',
    userMessage: '',
    expected: 'Email ama password waa khalad.'
  },
  {
    technical: 'Student not found',
    userMessage: '',
    expected: 'Arday lama helin.'
  },
  {
    technical: 'Email already exists',
    userMessage: '',
    expected: 'Email-kan hore ayaa loo diiwaan geliyay. Fadlan mid kale isticmaal.'
  },
  {
    technical: 'School blocked',
    userMessage: 'Your school is blocked',
    expected: 'Your school is blocked' // Should use userMessage
  },
  {
    technical: 'Class not found',
    userMessage: '',
    expected: 'Fasal lama helin.'
  }
];

console.log('🧪 Testing Error Message Mapper...\n');

testCases.forEach((test, index) => {
  const result = getErrorMessage(test.technical, test.userMessage);
  const passed = result === test.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Input: "${test.technical}"`);
  console.log(`  Expected: "${test.expected}"`);
  console.log(`  Got: "${result}"`);
  console.log('');
});

console.log('✨ Testing complete!');
