import * as PIXI from 'pixi.js';
import CContainer from '../core/CContainer.ts';
import SSymbolSprite from './SSymbolSprite.ts';
import TAssetsDictionary from '../types/TAssetsDictionary.ts';
import { Ticker } from 'pixi.js';
import PSlotsGameMode from './PSlotsGameMode.ts';
import PApp from '../core/PApp.ts';
import PGameMode from '../core/PGameMode.ts';


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
  
  private _PositionText: PIXI.Text | undefined;
  
  private _BlurFilter = new PIXI.BlurFilter();// reel's blur filter for better animation effect.
  
  
  constructor(options?: PIXI.ContainerOptions<PIXI.ContainerChild>) {
    super(options);
    this.setUpBlurFilter();
  }
  
  // bind to spin finish
  onAddedToStage(GameApp: PApp) {
    super.onAddedToStage(GameApp);
    
    GameApp.addListener(PApp.EVENT_GAMEMODE_SET, (gameMode: PGameMode) => {
      if (gameMode instanceof PSlotsGameMode) {
        
        // bind for later spins
        gameMode.addListener(PSlotsGameMode.EVENT_SPIN_FINISHED, this.highLightActiveSprites.bind(this));
        gameMode.addListener(PSlotsGameMode.EVENT_SPIN_STARTED, this.cancelAllHighLights.bind(this));
        
        // immediately check once
        this.highLightActiveSprites();
        
      }
    });
    
  }
  
  onRemovedFromStage(GameApp: PApp) {
    super.onRemovedFromStage(GameApp);
    
    GameApp.CurrentGameMode!.removeListener(PSlotsGameMode.EVENT_SPIN_FINISHED, this.highLightActiveSprites.bind(this));
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
  
  /**
   * this function marks the sprites as highlighted after the latest spin result.
   * right now all win lines use the same high light color.
   */
  public highLightActiveSprites() {
    if (!this.GameApp || !this.GameApp.CurrentGameMode) return;
    if (!this.ReelSymbolsArray.length) return;
    
    if (!this._BandID) {
      console.error('Reel hightlight: No BandID');
      return;
    }
    
    const reelIndex = this._BandID - 1;
    if (reelIndex < 0) {
      console.error('Reel hightlight: Invalid reel index');
      return;
    }
    
    const allActiveElements = (this.GameApp.CurrentGameMode as PSlotsGameMode).LastestActiveElementsMatrixTransposed;
    if (!allActiveElements.length) return;
    
    console.log('checking high light');
    allActiveElements.forEach((allReels) => {
      // each of them a representation of all reels of a win line.
      const activeElementsOfThisReel = allReels[reelIndex];
      
      activeElementsOfThisReel.forEach((isActive, index) => {
        // set the overlay, do nothing if not active
        if (isActive === 1)
          this.ReelSymbolsArray[index].bIsHighLighted = true;
        
      });
    });
    
    
  }
  
  // resets all high light
  public cancelAllHighLights() {
    this.ReelSymbolsArray.forEach((ssprite) => {
      ssprite.bIsHighLighted = false;
    });
  }
  
  private setUpBlurFilter() {
    // Initialize blur filter for motion effect
    this._BlurFilter.strengthX = 0;
    this._BlurFilter.strengthY = 0;
    this.filters = [this._BlurFilter];
  }
  
  public buildReel({ reelSet, assetsDictionary, bandID, symbolMaxSize }: {
    bandID: number,
    reelSet: string[],
    assetsDictionary: TAssetsDictionary,
    symbolMaxSize?: number,
  }) {
    
    if (bandID < 1)
      throw new Error('Build Reel: Reel BandID cannot be less than 1');
    
    this._BandID = bandID;
    this._ReelStripSet = reelSet;
    this._AssetsDictionary = assetsDictionary;
    this.ReelSymbolSize = symbolMaxSize;
    
    this.layout = {
      width: symbolMaxSize,
      height: symbolMaxSize
    };
    this.layout?.forceUpdate();
    
    // for debugging
    this.label = `Reel-${bandID}`;
    
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
    
    this.addPositionText();
    return this;
  }
  
  private addSymbol(symbolSprite: SSymbolSprite) {
    
    symbolSprite.y = this.children.length * (symbolSprite.height + CReel.SYMBOL_POS_SPACING_Y);
    
    // for debugging
    symbolSprite.label = `Symbol-${String(this.children.length)}`;
    
    this.ReelSymbolsArray.push(symbolSprite);
    this.addChild(symbolSprite);
  }
  
  private addPositionText() {
    this._PositionText = new PIXI.Text({
      anchor: 0,
      text: `Pos:${this.CurrentPosition}`,
      style: {
        stroke: { color: '#000', width: 4, join: 'round' },
        fill: '#ffffff',
        fontSize: 25
      }
    });
    this._PositionText.label = 'Reel Debug Text';
    this._PositionText.position.set(25, -50);
    this.addChild(this._PositionText);
  }
  
  private updatePositionText() {
    if (this._PositionText)
      this._PositionText.text = `Pos:${Math.round(this.CurrentPosition)}`;
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
        
        const newTexture = this._AssetsDictionary[symbolName];
        newTexture.update(); //manual syncs, trying to avoid the "width or height out of range" issue
        newTexture.updateUvs();
        
        ssprite.swapTexture({
          newTexture: newTexture,
          newName: symbolName
        });
      }
    }
    
    this.updatePositionText();
  }
  
  protected onResize() {
    super.onResize();
  }
  
}