/**
 * Extends the functionality of PIXI.Container
 */

import * as PIXI from 'pixi.js';
import '@pixi/layout';
import PApp from './PApp.ts';
import SSprite from './SSprite.ts';

type TCContainerConstructParams = PIXI.ContainerOptions<PIXI.ContainerChild> & {
  scaleWithBaseRes?: boolean;
}
export default class CContainer extends PIXI.Container {
  
  
  protected GameApp: PApp | null = null;
  
  protected bShouldScaleWithBaseRes = false;
  
  constructor({ scaleWithBaseRes, ...options }: TCContainerConstructParams = {}) {
    super(options);
    this.bShouldScaleWithBaseRes = scaleWithBaseRes || false;
  }
  
  
  public isAttached(): boolean {
    return this.parent !== null;
  }
  
  public isOnStage(): boolean {
    return this.parent !== null && this.GameApp !== null;
  }
  
  public onAddedToStage(GameApp: PApp) {
    
    this.GameApp = GameApp;
    
    GameApp.Instance.ticker.add(this.onTick.bind(this));
    GameApp.addListener(PApp.EVENT_RESIZE, this.onResize.bind(this));
    
    this.children.map(children => {
      if (children instanceof CContainer || children instanceof SSprite)
        children.onAddedToStage(GameApp);
    });
    
  }
  
  public onRemovedFromStage(GameApp: PApp) {
    
    GameApp.Instance.ticker.remove(this.onTick.bind(this));
    GameApp.removeListener(PApp.EVENT_RESIZE, this.onResize.bind(this));
    
    this.children.map(children => {
      if (children instanceof CContainer || children instanceof SSprite)
        children.onRemovedFromStage(GameApp);
    });
    
  }
  
  
  protected onResize(): void {
    if (!this.isOnStage()) return;
    
    this.layout?.forceUpdate();
    
    if (this.bShouldScaleWithBaseRes)
      this.reScaleWithBaseRes();
  }
  
  // calling this on resize is not a must, the decision is on the subclasses.
  protected reScaleWithBaseRes({ minScale }: { minScale?: number } = {}) {
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
    
    if (minScale && scale < minScale) return;
    this.scale.set(scale, scale);
    
  }
  
  protected onTick(ticker: PIXI.Ticker): void {
    void ticker; //placeholder
  }
}