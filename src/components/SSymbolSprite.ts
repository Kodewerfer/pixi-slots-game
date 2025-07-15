import * as PIXI from 'pixi.js';
import SSprite, { TSSpriteConstructParams } from '../core/SSprite.ts';

export type SSymbolSpriteOptions = TSSpriteConstructParams & {
  symbolName: string;
}

export default class SSymbolSprite extends SSprite {
  
  
  private _CurrentSymbolName: string | undefined; // this will be used after the spinning to calculate wins
  
  constructor({ symbolName, ...otherOptions }: SSymbolSpriteOptions) {
    super(otherOptions);
    this._CurrentSymbolName = symbolName;
  }
  
  
  get CurrentSymbolName(): string | undefined {
    return this._CurrentSymbolName;
  }
  
  set CurrentSymbolName(value: string) {
    this._CurrentSymbolName = value;
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