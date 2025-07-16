import { expect, test, beforeEach, describe } from 'vitest';
import PSlotsGameMode from '../src/components/PSlotsGameMode';


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
    
    const noWinResult = { '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {} };
    
    const result = instance.calculateWinLines(winlineTestInput);
    
    expect(result).toStrictEqual(noWinResult);
  });
  
  test('win in line 1 and 6', () => {
    const checkResult = { '1': { lv1: 3 }, '2': {}, '3': {}, '4': {}, '5': {}, '6': { lv1: 5 }, '7': {} };
    
    let inputMatrix = [
      ['lv1', 'lv1', 'lv1', 'lv4', 'lv1'],
      ['hv4', 'lv1', 'hv2', 'lv1', 'hv2'],
      ['lv2', 'lv4', 'lv1', 'lv2', 'lv2']
    ];
    const result = instance.calculateWinLines(inputMatrix);
    expect(result).toStrictEqual(checkResult);
  });
  
  test('win in line 3, 4, 5 and 6', () => {
    const checkResult = {
      '1': {},
      '2': {},
      '3': { hv3: 4 },
      '4': { hv3: 4 },
      '5': { hv3: 3 },
      '6': { hv3: 3 },
      '7': {}
    };
    
    let inputMatrix = [
      ['hv3', 'hv3', 'hv1', 'lv2', 'lv3'],
      ['hv2', 'hv3', 'hv3', 'hv4', 'lv4'],
      ['hv3', 'hv3', 'hv3', 'hv3', 'hv2']
    ];
    const result = instance.calculateWinLines(inputMatrix);
    expect(result).toStrictEqual(checkResult);
  });
  
  test('add points to win result - single', () => {
    const resultsWithPoints = { '1': { lv1: 5, points: 10 }, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {} };
    
    let input = { '1': { lv1: 5 }, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {} };
    
    const result = instance.addPointsToWins(input);
    expect(result).toStrictEqual(resultsWithPoints);
  });
  
  test('add points to win result - multiple', () => {
    const resultsWithPoints = {
      '1': {},
      '2': {},
      '3': { hv3: 4, points: 10 },
      '4': { hv3: 4, points: 10 },
      '5': { hv3: 3, points: 5 },
      '6': { hv3: 3, points: 5 },
      '7': {}
    };
    
    let input = {
      '1': {},
      '2': {},
      '3': { hv3: 4 },
      '4': { hv3: 4 },
      '5': { hv3: 3 },
      '6': { hv3: 3 },
      '7': {}
    };
    const result = instance.addPointsToWins(input);
    expect(result).toStrictEqual(resultsWithPoints);
  });
  
  
});