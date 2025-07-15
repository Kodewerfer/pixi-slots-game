import PGameMode from '../core/PGameMode.ts';
import CReelsWrapper from './CReelsWrapper.ts';
import CReel from './CReel.ts';

import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

export default class PSlotsGameMode extends PGameMode {
  
  
  public static EVEN_SPIN_STARTED = 'SPIN_STARTED';
  public static EVEN_SPIN_FINISHED = 'SPIN_FINISHED';
  
  
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
  
  public FinishedSpinning() {
    
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