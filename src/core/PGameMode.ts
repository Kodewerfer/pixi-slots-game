/**
 * a (P)ixi app (Game Mode)
 * Abstract layer that handles primarily the logic within a "level"
 */

import EventEmitter from 'eventemitter3';
import PApp from './PApp.ts';
import * as PIXI from 'pixi.js';

export default class PGameMode extends EventEmitter {
  
  
  public static readonly EVENT_ACTIVE: string = 'ACTIVE';
  public static readonly EVENT_Dormant: string = 'DORMANT';
  
  
  protected GameApp: PApp | null = null;
  
  
  constructor() {
    super();
  }
  
  public onActive(GameApp: PApp) {
    this.GameApp = GameApp;
    this.emit(PGameMode.EVENT_ACTIVE, this);
    GameApp.addListener(PApp.EVENT_INITIALIZE_SUCCESS, this.bindTicker.bind(this));
  }
  
  private bindTicker() {
    if (!this.GameApp) {
      console.error('GameMode: Failed to bind ticker');
      return;
    }
    this.GameApp.Instance.ticker.add(this.onTick.bind(this));
    
  }
  
  public onDormant(GameApp: PApp) {
    GameApp.Instance.ticker.remove(this.onTick.bind(this));
    this.emit(PGameMode.EVENT_Dormant, this);
  }
  protected onTick(ticker: PIXI.Ticker) {
    void ticker; //placeholder
  }
  
}