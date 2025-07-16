import { expect, test, beforeEach, describe } from 'vitest';
import PSlotsGameMode from '../src/components/PSlotsGameMode';
import { TWinLinesResults } from '../src/types/TWinLinesResults';


describe('PSlotsGameMode', () => {
  let instance: PSlotsGameMode;
  
  beforeEach(() => {
    instance = new PSlotsGameMode();
  });
  
  test('no win lines', () => {
    
    let winlineTestInput = [
      ['lv4', 'lv1', 'lv1', 'lv4', 'hv4'],
      ['hv4', 'lv2', 'hv2', 'hv3', 'hv2'],
      ['lv1', 'lv4', 'lv3', 'lv2', 'lv2']
    ];
    
    const noWinResult = [{}, {}, {}, {}, {}, {}, {}];
    
    const result = instance.calculateWinLines(winlineTestInput);
    
    expect(result).toStrictEqual(noWinResult);
  });
  
  test('win in line 1 and 6', () => {
    let inputMatrix = [
      ['lv1', 'lv1', 'lv1', 'lv4', 'lv1'],
      ['hv4', 'lv1', 'hv2', 'lv1', 'hv2'],
      ['lv2', 'lv4', 'lv1', 'lv2', 'lv2']
    ];
    
    const checkResult = [{ lv1: 3 }, {}, {}, {}, {}, { lv1: 5 }, {}];
    
    const result = instance.calculateWinLines(inputMatrix);
    expect(result).toStrictEqual(checkResult);
  });
  
  test('add points to win result - multiple', () => {
    
    let input: TWinLinesResults = [
      {},
      {},
      { hv3: 4 },
      { hv3: 4 },
      { hv3: 3 },
      { hv3: 3 },
      {}
    ];
    
    const resultsWithPoints = [
      {},
      {},
      { hv3: 4, points: 10 },
      { hv3: 4, points: 10 },
      { hv3: 3, points: 5 },
      { hv3: 3, points: 5 },
      {}
    ];
    
    
    const result = instance.addPointsToWins(input);
    expect(result).toStrictEqual(resultsWithPoints);
  });
  
  test('get what elements to mark as active from spin result', () => {
    
    // the points are only used to check if there is a win, the actual value does not matter here.
    const input: TWinLinesResults = [
      { lv1: 3, points: 999 },
      {},
      {},
      { hv3: 4, points: 999 },
      {},
      { hv3: 3, points: 999 },
      {}
    ];
    
    const exp_result = [
      [ // win line 1
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ],
      [ // win line 4
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      [ // win line 6
        [1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0]
      ]
    ];
    
    
    const result = instance.calculateActiveElements(input);
    console.log(result);
    expect(result).toStrictEqual(exp_result);
  });
  
  
});