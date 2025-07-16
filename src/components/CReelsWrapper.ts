import CContainer from '../core/CContainer.ts';
import CReel from './CReel.ts';
import * as PIXI from 'pixi.js';

export default class CReelsWrapper extends CContainer {
  
  
  public static readonly REELS_GAP_X = 5;
  public static readonly REELS_MARGIN_BOTTOM = '25%';
  
  
  public ReelsArray: CReel[] | undefined;
  
  
  // override layout styling
  constructor(options?: PIXI.ContainerOptions<PIXI.ContainerChild>) {
    super(options);
    
    this.layout = {
      width: 'auto', //using "auto" disables the animation effect but make re-scaling possible.
      height: 'auto',
      marginBottom: CReelsWrapper.REELS_MARGIN_BOTTOM,
      gap: CReelsWrapper.REELS_GAP_X,
      flexShrink: 0,
      flexGrow: 0,
      flexWrap: 'nowrap',
      alignSelf: 'center',
      justifyContent: 'center',
      alignContent: 'center',
      flexDirection: 'row',
      objectFit: 'contain',
      objectPosition: 'center',
      transformOrigin: 'center',
      overflow: 'hidden'
    };
    
    this.layout?.forceUpdate();
    this.reScaleWithBaseRes();
  }
  
  // NOTE: IMPORTANT:
  // This gets the symbol in their "array order", whether it be container.children or the CReel's prop
  // This works right now because the sprites are not really moving.
  // if the animation is position base, meaning the sprites actually move, then this order will be incorrect.
  public getReelsSymbolNameMatrixArrayOrder() {
    let nameMatrix: string[][] = [];
    
    this.ReelsArray?.map((reel) => {
      
      const symbolNamesArray: string[] = [];
      
      reel.ReelSymbolsArray.map((reelSymbol) => {
        symbolNamesArray.push(reelSymbol.CurrentSymbolName || ' ');
      });
      
      nameMatrix.push(symbolNamesArray);
      
    });
    
    return nameMatrix;
    
  }
  
  public addReels(reels: CReel[]) {
    reels.map((reel) => {
      this.addChild(reel);
    });
    
    this.ReelsArray = [...reels];
    this.reScaleWithBaseRes();
  }
  
  protected onResize() {
    super.onResize();
    this.reScaleWithBaseRes();
  }
  
}