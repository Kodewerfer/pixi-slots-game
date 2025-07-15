import CContainer from '../core/CContainer.ts';
import SSymbolSprite from './SSymbolSprite.ts';
import TAssetsDictionary from '../types/TAssetsDictionary.ts';
import { BlurFilter, Ticker } from 'pixi.js';
import * as PIXI from 'pixi.js';


export default class CReel extends CContainer {
  
  public static readonly SYMBOL_COUNT = 3;
  public static readonly SYMBOL_POS_SPACING_Y = 5;
  
  public ReelSymbolsArray: SSymbolSprite[] = [];
  public ReelSymbolSize: number | undefined;
  
  private _BandID: number | undefined;
  
  private _ReelStripSet: string[] = [];
  private _AssetsDictionary: TAssetsDictionary | undefined;
  
  private _CurrentPosition = 0;
  private _PreviousPosition = 0;
  
  private readonly _BlurFilter: BlurFilter | undefined;// reel's blur filter for better animation effect.
  
  
  constructor(options?: PIXI.ContainerOptions<PIXI.ContainerChild>) {
    super(options);
    
    
    // Initialize blur filter for motion effect
    this._BlurFilter = new PIXI.BlurFilter();
    this._BlurFilter.strengthX = 0;
    this._BlurFilter.strengthY = 0;
    this.filters = [this._BlurFilter];
    
  }
  
  
  get CurrentPosition(): number {
    return this._CurrentPosition;
  }
  
  set CurrentPosition(value: number) {
    this._CurrentPosition = value;
  }
  
  get ReelStripSet() {
    return this._ReelStripSet;
  }
  
  get BandID(): number | undefined {
    return this._BandID;
  }
  
  
  public buildReel({ reelSet, assetsDictionary, bandIndex, symbolMaxSize }: {
    bandIndex: number,
    reelSet: string[],
    assetsDictionary: TAssetsDictionary,
    symbolMaxSize?: number,
  }) {
    
    this._BandID = bandIndex;
    this._ReelStripSet = reelSet;
    this._AssetsDictionary = assetsDictionary;
    this.ReelSymbolSize = symbolMaxSize;
    
    this.layout = {
      width: symbolMaxSize,
      height: symbolMaxSize
    };
    this.layout?.forceUpdate();
    
    // for debugging
    this.label = `Reel-${bandIndex}`;
    
    // build up to CReel.SYMBOL_COUNT number of symbols using the reelset and assets
    for (let index = 0; index < CReel.SYMBOL_COUNT; index++) {
      const reelSymbolText = reelSet[index];
      
      if (!assetsDictionary[reelSymbolText]) {
        console.error(`buildReel: Missing loaded asset of ${reelSymbolText}`);
        return;
      }
      
      const SymbolSprite = new SSymbolSprite({
        texture: assetsDictionary[reelSymbolText],
        maxSize: symbolMaxSize,
        symbolName: reelSymbolText
      });
      
      this.addSymbol(SymbolSprite);
    }
    
    return this;
  }
  
  private addSymbol(symbolSprite: SSymbolSprite) {
    
    symbolSprite.y = this.children.length * (symbolSprite.height + CReel.SYMBOL_POS_SPACING_Y);
    
    // for debugging
    symbolSprite.label = `Symbol-${String(this.children.length)}`;
    
    this.ReelSymbolsArray.push(symbolSprite);
    this.addChild(symbolSprite);
  }
  
  //animates the reel according to reel's position information
  // simple texture swaping animation
  protected onTick(ticker: Ticker) {
    super.onTick(ticker);
    
    // Update blur based on delta position
    if (this._BlurFilter) {
      const deltaP = this._CurrentPosition - this._PreviousPosition;
      this._BlurFilter.strengthY = deltaP * 8 * (ticker.deltaTime * 60);
    }
    this._PreviousPosition = this._CurrentPosition;
    
    if (!this._AssetsDictionary) return;
    
    // Number of symbols
    const N = this._ReelStripSet.length;
    
    // For each visible slot (0 = topmost)
    for (let slotIndex = 0; slotIndex < this.ReelSymbolsArray.length; slotIndex++) {
      const logicalIndex = Math.round(this._CurrentPosition) + slotIndex;
      // Proper wrapping into [0, N)
      const wrappedIndex = ((logicalIndex % N) + N) % N;
      const symbolName = this._ReelStripSet[wrappedIndex];
      
      const ssprite = this.ReelSymbolsArray[slotIndex];
      
      // Swap texture if not already showing
      if (ssprite.CurrentSymbolName !== symbolName) {
        ssprite.swapTexture({
          newTexture: this._AssetsDictionary[symbolName],
          newName: symbolName
        });
      }
    }
  }
  
  protected onResize() {
    super.onResize();
  }
  
}