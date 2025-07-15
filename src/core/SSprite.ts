/**
 * Extended PIXI.Sprite
 */

import * as PIXI from 'pixi.js';
import PApp from './PApp.ts';

export type TSSpriteConstructParams = { texture?: PIXI.Texture, maxSize?: number }

export default class SSprite extends PIXI.Sprite {
  
  
  protected GameApp: PApp | null = null;
  
  
  protected baseWidth: number | undefined;
  protected baseHeight: number | undefined;
  
  private readonly _scalingFactor: number = 1;
  
  private _helperText: PIXI.Text = new PIXI.Text({ text: this.label });
  
  
  constructor({ texture, maxSize }: TSSpriteConstructParams) {
    super(texture);
    
    this.baseWidth = texture?.width;
    this.baseHeight = texture?.height;
    
    if (maxSize && this.baseWidth && this.baseHeight) {
      this._scalingFactor = this.scale.x = this.scale.y = Math.min(maxSize / this.baseWidth, maxSize / this.baseHeight);
    }
    
  }
  
  
  public setDebugLabel(text: string) {
    this.label = text;
    
    this._helperText.text = text;
    this._helperText.anchor = 0.5;
    
    // will give deprecation warning
    this.addChild(this._helperText);
  }
  
  
  public isAttached(): boolean {
    return this.parent !== null;
  }
  
  
  public isOnStage(): boolean {
    return this.parent !== null && this.GameApp !== null;
  }
  
  
  public isTextureValid(): boolean {
    
    if (!this.texture)
      return false;
    
    return !(this.texture.width === 0 || this.texture.height === 0);
    
  }
  
  public onAddedToStage(GameApp: PApp) {
    this.GameApp = GameApp;
    
    GameApp.Instance.ticker.add(this.onTick.bind(this));
    GameApp.addListener(PApp.EVENT_RESIZE, this.onResize.bind(this));
    
    // Attach to App Resize
    this.GameApp.addListener(PApp.EVENT_RESIZE, this.onResize.bind(this));
  }
  
  public onRemovedFromStage(GameApp: PApp) {
    GameApp.Instance.ticker.remove(this.onTick.bind(this));
    GameApp.removeListener(PApp.EVENT_RESIZE, this.onResize.bind(this));
  }
  
  
  protected onResize(): void {
    if (!this.isOnStage() || !this.isTextureValid()) {
      return;
    }
    this.layout?.forceUpdate();
  }
  
  protected reScaleSprite() {
    
    if (!this.baseWidth || !this.baseHeight) return;
    
    this.width = this.baseWidth * this._scalingFactor;
    this.height = this.baseHeight * this._scalingFactor;
  }
  
  // this is not a must, the decision is on the subclasses.
  protected reScaleWithBaseRes() {
    if (!this.GameApp) return;
    
    const { width: baseWidth, height: baseHeight } = this.GameApp.BaseResolution;
    const { width: currentWidth, height: currentHeight } = this.GameApp.Screen;
    
    const baseArea = baseWidth * baseHeight;
    const currentArea = currentWidth * currentHeight;
    
    // Handle division by zero and negative values
    if (baseArea <= 0 || currentArea <= 0) {
      this.scale.set(0, 0);
      return;
    }
    
    // Calculate uniform scale factor (square root of area ratio)
    const scale = Math.sqrt(currentArea / baseArea);
    this.scale.set(scale, scale);
    
  }
  
  // @ts-ignore to be implemented in subclasses
  protected onTick(ticker: PIXI.Ticker): void {
  }
}
