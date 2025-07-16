import * as PIXI from 'pixi.js';
import SSprite, { TSSpriteConstructParams } from '../core/SSprite.ts';
import { ColorOverlayFilter } from 'pixi-filters';

export type SSymbolSpriteOptions = TSSpriteConstructParams & {
  symbolName: string;
}

export default class SSymbolSprite extends SSprite {
  
  
  private _CurrentSymbolName: string | undefined; // this will be used after the spinning to calculate wins
  
  private _ColorFilter = new ColorOverlayFilter({ color: '#EF6461', alpha: 0 }); //apply a color even to black and white image
  
  constructor({ symbolName, ...otherOptions }: SSymbolSpriteOptions) {
    super(otherOptions);
    this._CurrentSymbolName = symbolName;
    this.filters = this._ColorFilter;
  }
  
  set highLightColorHex(value: string) {
    this._ColorFilter.color = value;
  }
  
  set bIsHighLighted(value: boolean) {
    if (value)
      this._ColorFilter.alpha = 1;
    else
      this._ColorFilter.alpha = 0;
  }
  
  
  get CurrentSymbolName(): string | undefined {
    return this._CurrentSymbolName;
  }
  
  
  public swapTexture({ newTexture, newName }: { newTexture: PIXI.Texture, newName: string }) {
    this._CurrentSymbolName = newName;
    this.texture = newTexture;
    this.onResize();
  }
  
  
  protected onResize() {
    super.onResize();
    this.reScaleSprite();
  }
  
}