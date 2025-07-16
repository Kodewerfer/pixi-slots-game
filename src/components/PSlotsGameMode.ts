import PGameMode from '../core/PGameMode.ts';
import CReelsWrapper from './CReelsWrapper.ts';
import CReel from './CReel.ts';

import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { TLineResult, TWinLinesResults, TWinLinesResultsWithPoints } from '../types/TWinLinesResults.ts';

export default class PSlotsGameMode extends PGameMode {
  
  
  public static EVEN_SPIN_STARTED = 'SPIN_STARTED';
  public static EVEN_SPIN_FINISHED = 'SPIN_FINISHED';
  
  
  /**
   *  Pay line id | visual description
   * -------------|--------------------
   *              |      - - - - -
   *       1      |      x x x x x
   *              |      - - - - -
   * -------------|--------------------
   *              |      x x x x x
   *       2      |      - - - - -
   *              |      - - - - -
   * -------------|--------------------
   *              |      - - - - -
   *       3      |      - - - - -
   *              |      x x x x x
   * -------------|--------------------
   *              |      x x - - -
   *       4      |      - - x - -
   *              |      - - - x x
   * -------------|--------------------
   *              |      - - - x x
   *       5      |      - - x - -
   *              |      x x - - -
   * -------------|--------------------
   *              |      x - - - x
   *       6      |      - x - x -
   *              |      - - x - -
   * -------------|--------------------
   *              |      - - x - -
   *       7      |      - x - x -
   *              |      x - - - x
   */
  // Define win line patterns, the number in the array is where the "line" is in each column(taking in a 5 col 3 rows matrix of symbols)
  public static WIN_CONDITION_PATTERNS: { [id: string]: number[] } = {
    1: [0, 0, 0, 0, 0],
    2: [1, 1, 1, 1, 1],
    3: [2, 2, 2, 2, 2],
    4: [0, 0, 1, 2, 2],
    5: [2, 2, 1, 0, 0],
    6: [0, 1, 2, 1, 0],
    7: [2, 1, 0, 1, 2]
  };
  
  /**
   *  Symbol id | 3 of a kind | 4 of a kind | 5 of a kind
   * -----------|-------------|-------------|-------------
   *      hv1   |      10     |      20     |      50
   * -----------|-------------|-------------|-------------
   *      hv2   |      5      |      10     |      20
   * -----------|-------------|-------------|-------------
   *      hv3   |      5      |      10     |      15
   * -----------|-------------|-------------|-------------
   *      hv4   |      5      |      10     |      15
   * -----------|-------------|-------------|-------------
   *      lv1   |      2      |      5      |      10
   * -----------|-------------|-------------|-------------
   *      lv2   |      1      |      2      |      5
   * -----------|-------------|-------------|-------------
   *      lv3   |      1      |      2      |      3
   * -----------|-------------|-------------|-------------
   *      lv4   |      1      |      2      |      3
   * -----------|-------------|-------------|-------------
   */
  public static POINTS_LOOKUP_TABLE: Record<string, Record<number, number>> = {
    'hv1': { 3: 10, 4: 20, 5: 50 },
    'hv2': { 3: 5, 4: 10, 5: 20 },
    'hv3': { 3: 5, 4: 10, 5: 15 },
    'hv4': { 3: 5, 4: 10, 5: 15 },
    'lv1': { 3: 2, 4: 5, 5: 10 },
    'lv2': { 3: 1, 4: 2, 5: 5 },
    'lv3': { 3: 1, 4: 2, 5: 3 },
    'lv4': { 3: 1, 4: 2, 5: 3 }
  };
  
  
  public GameRunning: boolean = false;
  
  
  public ReelsWrapper: CReelsWrapper | undefined = undefined;
  
  
  onActive(GameApp: any) {
    super.onActive(GameApp);
    console.info('Slots Game Mode Active');
    gsap.registerPlugin(PixiPlugin);
  }
  
  public StartSpinning() {
    
    if (!this.ReelsWrapper || !this.ReelsWrapper.ReelsArray) {
      console.error('Slots Game Mode: Reels Not Set');
      return;
    }
    
    if (this.GameRunning) return;
    
    this.GameRunning = true;
    
    this.emit(PSlotsGameMode.EVEN_SPIN_STARTED, this);
    console.info('Spinning Begins');
    
    let ReelsMaxIndex = this.ReelsWrapper.ReelsArray.length;
    
    for (let reelIndex = 0; reelIndex < ReelsMaxIndex; reelIndex++) {
      
      const reel = (this.ReelsWrapper.ReelsArray[reelIndex]) as CReel;
      const randomOffset = Math.floor(Math.random() * 3);
      const spinTargetPosition = reel.CurrentPosition + 10 + reelIndex * 5 + randomOffset;
      const spinTime = 2500 + reelIndex * 600 + randomOffset * 600;
      
      console.log(`spinTargetPosition for Reel ${reelIndex + 1} = ${spinTargetPosition}`);
      
      // tween the CurrentPosition of a Reel according to the rando value
      gsap.to(reel, {
        'CurrentPosition': spinTargetPosition,
        duration: spinTime / 1000,// Convert to seconds
        ease: 'back.out',
        onComplete: () => {
          if (reelIndex === ReelsMaxIndex - 1)
            this.FinishedSpinning();
        }
      });
    }
  }
  
  // check a given win line, and return connected 3 symbols
  public calculateWinLines(matrix: string[][]) {
    // Validate input matrix
    if (matrix.length !== 3 || matrix.some(row => row.length !== 5)) {
      throw new Error('Matrix must be 3 rows × 5 columns');
    }
    
    const winLines = PSlotsGameMode.WIN_CONDITION_PATTERNS;
    
    // Check consecutive matches for a symbol sequence
    const checkConsecutiveSymbols = (symbols: string[] | number[]): TLineResult => {
      const startingSymbol = symbols[0];
      let sameSymbolsCount = 1;
      
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] === startingSymbol) sameSymbolsCount++;
        else break; // Stop at first mismatch
      }
      
      return sameSymbolsCount >= 3 ? { [startingSymbol]: sameSymbolsCount } : {};
    };
    
    // Process all win lines
    const results: TWinLinesResults = {};
    
    Object.keys(winLines).forEach(lineId => {
      const pattern = winLines[lineId as keyof typeof winLines];
      const symbols = pattern.map((rowIdx, colIdx) => matrix[rowIdx][colIdx]);
      results[lineId] = checkConsecutiveSymbols(symbols);
    });
    
    return results;
  }
  
  public addPointsToWins(winResults: TWinLinesResults): TWinLinesResults {
    // Payout table definition
    const pointsTable = PSlotsGameMode.POINTS_LOOKUP_TABLE;
    
    // Process each win line from 1-7
    for (const lineId in winResults) {
      
      const winResult = winResults[lineId];
      
      if (Object.keys(winResult).length > 0) { //have a win in that win line
        
        const symbolName = Object.keys(winResult)[0];
        const nOfAKind: number = (winResult[symbolName]) as number;
        
        if (pointsTable[symbolName] && pointsTable[symbolName][nOfAKind]) {
          winResult.points = pointsTable[symbolName][nOfAKind];
        }
      }
    }
    
    return winResults;
  }
  
  protected FinishedSpinning() {
    
    this.GameRunning = false;
    
    console.info('Spinning Finished for the last reel.');
    
    this.emit(PSlotsGameMode.EVEN_SPIN_FINISHED, this);
    
    let reelsSymbolNameMatrixArrayOrder = this.ReelsWrapper?.getReelsSymbolNameMatrixArrayOrder();
    
    console.log(`Spin Result:`, reelsSymbolNameMatrixArrayOrder);
    console.log(`Spin Result transposed: `, PSlotsGameMode.transposeMatrix(reelsSymbolNameMatrixArrayOrder!));
  }
  
  // Transpose a 2D array (matrix).
  // used for transposing the spine result.
  public static transposeMatrix<T>(matrix: T[][]): T[][] {
    if (matrix.length === 0) return [];
    return matrix[0].map((_, colIdx) =>
      matrix.map(row => row[colIdx])
    );
  }
  
}