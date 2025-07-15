import { expect, test, beforeEach, describe } from 'vitest';
import PSlotsGameMode from '../src/components/PSlotsGameMode';


describe('PSlotsGameMode', () => {
  let instance: PSlotsGameMode;
  
  beforeEach(() => {
    instance = new PSlotsGameMode();
  });
  
  test('test calc winline', () => {
    let winlineTestInput = 1;
    const result = instance.calculateWinLines(winlineTestInput);
    expect(result).toBe(winlineTestInput);
  });
  
});