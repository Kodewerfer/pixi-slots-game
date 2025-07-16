import PGameMode from '../core/PGameMode.ts';
import CReelsWrapper from './CReelsWrapper.ts';
import CReel from './CReel.ts';

import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { TLineResult, TWinLinesResults } from '../types/TWinLinesResults.ts';
import PApp from '../core/PApp.ts';

// the main logic of a "level"
export default class PSlotsGameMode extends PGameMode {
  
  
  // the main UI will make use of both of these events.
  public static EVENT_SPIN_STARTED = 'SPIN_STARTED'; //fires as soon as conditions are met, before tweening begins.
  public static EVENT_SPIN_FINISHED = 'SPIN_FINISHED'; //fires only after calculation is complete.
  
  // rando algo params
  public static REEL_LENGTH = 20;
  public static BASE_SPINS = 1;
  public static EXTRA_SPINS = 1;
  
  
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
    // Define win line patterns, the number in the array is where the "line" is in each col (taking in a 5 col by 3 rows matrix of symbols)
  public static WIN_CONDITION_PATTERNS = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2]
  ];
  
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
  // @ts-expect-error unused warning, no real use for these two for now.
  private _LatestSpinResultRaw: string[][] = [];
  
  // these two will be consumed by UI
  public LastestSpinResultProcessed: TWinLinesResults = [];
  public LastestActiveElementsMatrixTransposed: number[][][] = []; // this value is transposed so that it matches the actual elements structure
  
  
  public ReelsWrapper: CReelsWrapper | undefined = undefined;
  
  
  // also immediately trigger a spin finish to check for the current reels
  onActive(GameApp: PApp) {
    super.onActive(GameApp);
    console.info('Slots Game Mode Active');
    gsap.registerPlugin(PixiPlugin);
    this.onFinishedSpinning();
  }
  
  /**
   * @param toPositions optional,debugging use. spin each reel to a designated position. has to be length of 5
   */
  public StartSpinning({ toPositions }: { toPositions?: [number, number, number, number, number] } = {}) {
    
    if (!this.ReelsWrapper || !this.ReelsWrapper.ReelsArray) {
      console.error('Slots Game Mode: Reels Not Set');
      return;
    }
    
    if (this.GameRunning) return;
    this.GameRunning = true;
    
    this.emit(PSlotsGameMode.EVENT_SPIN_STARTED, this);
    console.info('Spinning Begins');
    
    const ReelsMaxIndex = this.ReelsWrapper.ReelsArray.length;
    
    for (let reelIndex = 0; reelIndex < ReelsMaxIndex; reelIndex++) {
      const reel = this.ReelsWrapper.ReelsArray[reelIndex] as CReel;
      
      // Generate random offset for duration variance (0-2)
      const durationRandomOffset = Math.floor(Math.random() * 3);
      
      let spinTargetPosition;
      
      if (toPositions && toPositions.length === ReelsMaxIndex) {
        // Use predefined target position
        spinTargetPosition = toPositions[reelIndex];
      } else {
        const finalStop = Math.floor(Math.random() * PSlotsGameMode.REEL_LENGTH);
        
        let minimalDistance = (finalStop - reel.CurrentPosition) % PSlotsGameMode.REEL_LENGTH;
        if (minimalDistance < 0) minimalDistance += PSlotsGameMode.REEL_LENGTH;
        
        const fullSpins = PSlotsGameMode.BASE_SPINS + PSlotsGameMode.EXTRA_SPINS + reelIndex;
        
        spinTargetPosition = reel.CurrentPosition + fullSpins + minimalDistance;
      }
      
      const spinTime = 2500 + reelIndex * 600 + durationRandomOffset * 600;
      
      console.log(`Reel ${reelIndex + 1} stopping at: ${
        spinTargetPosition % PSlotsGameMode.REEL_LENGTH
      } (target pos: ${spinTargetPosition})`);
      
      gsap.to(reel, {
        'CurrentPosition': spinTargetPosition,
        duration: spinTime / 1000, //shorten the time by half for better demo
        ease: 'back.out',
        onComplete: () => {
          if (reelIndex === ReelsMaxIndex - 1) {
            this.onFinishedSpinning();
          }
        }
      });
    }
  }
  
  /**
   *  check a given win line, and return connected 3 symbols
   *  extract all symbols of the inputs, from a win line, to form a new array, then check the array for consecutive strings
   *  do this for all seven win lines
   *  if there is no win, returns an empty object
   * @param matrix
   */
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
    const results: TWinLinesResults = [];
    
    winLines.map((winPattern) => {
      // extract all symbols of the input from a win line
      const symbols = winPattern.map((rowIdx, colIdx) => matrix[rowIdx][colIdx]);
      results.push(checkConsecutiveSymbols(symbols));
    });
    
    return results;
  }
  
  public addPointsToWins(winResults: TWinLinesResults): TWinLinesResults {
    // Payout table definition
    const pointsTable = PSlotsGameMode.POINTS_LOOKUP_TABLE;
    
    // Process each win line from 1-7
    winResults.map(winlineResult => {
      if (Object.keys(winlineResult).length > 0) { //have a win in that win line
        
        const symbolName = Object.keys(winlineResult)[0];
        const nOfAKind: number = (winlineResult[symbolName]) as number;
        
        if (pointsTable[symbolName] && pointsTable[symbolName][nOfAKind]) {
          winlineResult.points = pointsTable[symbolName][nOfAKind];
        }
        
      }
    });
    
    return winResults;
  }
  
  /**
   * Use the win results to calculate which sprite should be highlighted
   * each result will be a representation of the whole matrix, 0 as passive, 1 as active.
   * @param winResults
   * @return number[][][]
   */
  public calculateActiveElements(winResults: TWinLinesResults) {
    
    const winLines = PSlotsGameMode.WIN_CONDITION_PATTERNS;
    // each result will be a representation of the matrix, 0 as passive, 1 as active.
    const allActiveMatrixTransposed: number[][][] = []; // have to use a 3d array now, this is getting out of hand
    
    winResults.map((winResult, winLineIndex) => {
      
      const resultMatrix = PSlotsGameMode.createEmptyMatrix(3, 5);
      
      if (!winResult.points) return; //no result;
      const symbolName = Object.keys(winResult)[0];
      const nOfAKind: number = (winResult[symbolName]) as number;
      
      const winLineRef = winLines[winLineIndex];
      
      // Mark active positions in the matrix
      for (let col = 0; col < nOfAKind; col++) {
        const row = winLineRef[col];
        resultMatrix[row][col] = 1;
      }
      
      // transpose the result matrix so it will be easier for the UI to consume
      allActiveMatrixTransposed.push(PSlotsGameMode.transposeMatrix(resultMatrix));
      
    });
    
    return allActiveMatrixTransposed;
    
  }
  
  protected onFinishedSpinning() {
    
    this.GameRunning = false;
    
    console.info('Spinning Finished for the last reel.');
    
    const reelsSymbolNameMatrixArrayOrder = this.ReelsWrapper?.getReelsSymbolNameMatrixArrayOrder();
    
    console.log(`Spin Result:`, reelsSymbolNameMatrixArrayOrder);
    
    const transposeMatrix = PSlotsGameMode.transposeMatrix(reelsSymbolNameMatrixArrayOrder!);
    this._LatestSpinResultRaw = transposeMatrix;
    
    console.log(`Spin Result transposed: `, transposeMatrix);
    
    const winLinesData = this.calculateWinLines(transposeMatrix);
    
    this.LastestSpinResultProcessed = this.addPointsToWins(winLinesData);
    this.LastestActiveElementsMatrixTransposed = this.calculateActiveElements(this.LastestSpinResultProcessed);
    
    this.emit(PSlotsGameMode.EVENT_SPIN_FINISHED, this); //UI will use this event
  }
  
  // Transpose a 2D array (matrix).
  // used for transposing the spine result.
  public static transposeMatrix<T>(matrix: T[][]): T[][] {
    if (matrix.length === 0) return [];
    return matrix[0].map((_, colIdx) =>
      matrix.map(row => row[colIdx])
    );
  }
  
  // Create empty 3x5 matrix filled with 0s
  public static createEmptyMatrix(rowNum: number, colNum: number): number[][] {
    return Array.from({ length: rowNum }, () => Array(colNum).fill(0));
  }
  
}