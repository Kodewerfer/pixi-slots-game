/**
 * (P)ixi (App)lication
 * This serves as the top-most layer
 * All business logic should be handled by other classes that piggy-back on the onTick
 */

import * as PIXI from 'pixi.js';
import '@pixi/layout';
import EventEmitter from 'eventemitter3';
import SSprite from './SSprite.ts';
import CContainer from './CContainer.ts';
import PGameMode from './PGameMode.ts';
import PLevel from './PLevel.ts';

export default class PApp extends EventEmitter {
  
  
  public static readonly EVENT_INITIALIZE_SUCCESS: string = 'INITIALIZE_SUCCESS';
  public static readonly EVENT_INITIALIZE_FAILED: string = 'INITIALIZE_FAILED';
  public static readonly EVENT_RESIZE: string = 'RESIZE';
  
  
  private readonly _BaseResWidth: number;
  private readonly _BaseResHeight: number;
  private readonly _Instance: PIXI.Application; //stores the instance for the running app
  private readonly _RenderTargetID: string; //the HTML ID for the scene root
  
  private _Screen: PIXI.Rectangle = new PIXI.Rectangle();// for ease of use
  
  
  private _CurrentLevel: PLevel | undefined | null; // only a single "level" presents at a time.
  private _CurrentGameMode: PGameMode | undefined | null; //the "game mode" for the current level
  
  
  constructor({ baseScreenWidth, baseScreenHeight, renderTargetID }: {
    baseScreenWidth: number,
    baseScreenHeight: number,
    renderTargetID: string
  }) {
    
    super();
    
    this._BaseResWidth = baseScreenWidth;
    this._BaseResHeight = baseScreenHeight;
    this._RenderTargetID = renderTargetID;
    
    this._Instance = new PIXI.Application();
  }
  
  get BaseResolution() {
    return { width: this._BaseResWidth, height: this._BaseResHeight };
  }
  
  get CurrentGameMode(): PGameMode | undefined | null {
    return this._CurrentGameMode;
  }
  
  get CurrentLevel(): PLevel | undefined | null {
    return this._CurrentLevel;
  }
  
  set CurrentLevel(newLevel: PLevel | null) {
    if (this._CurrentLevel) {
      this._CurrentLevel.onDormant(this);
    }
    this._CurrentLevel = newLevel;
    newLevel?.onActive(this);
  }
  
  set CurrentGameMode(gameMode: PGameMode | null) {
    
    if (!gameMode && this._CurrentGameMode) {
      this._CurrentGameMode.onDormant(this);
      this._CurrentGameMode = null;
    }
    
    if (!gameMode) return;
    
    this._CurrentGameMode = gameMode;
    gameMode.onActive(this);
  }
  
  get Screen() {
    return this._Screen;
  }
  
  get RenderTargetID() {
    return this._RenderTargetID;
  }
  
  get Instance(): PIXI.Application {
    return this._Instance;
  }
  
  
  public async Init({ bgColor = '#e57373' }: { bgColor: string }) {
    try {
      await this._Instance.init({
        resizeTo: window,
        backgroundColor: bgColor,
        textureGCActive: true,
        textureGCMaxIdle: 3600,
        textureGCCheckCountMax: 1200
      });
      
      this._Instance.stage.label = 'Stage';
      this._Instance.stage.scale = 1;
      
      this._Instance.stage.layout = {
        width: this._Instance.screen.width,
        height: this._Instance.screen.height,
        overflow: 'hidden',
        flexWrap: 'nowrap'
      };
      
      const CanvasContainer = document.getElementById(this._RenderTargetID);
      const AppCanvas = this.Instance.canvas;
      
      if (!CanvasContainer) {
        console.error('Render target not found. Check container ID.');
        this.emit(PApp.EVENT_INITIALIZE_FAILED, this);
        return;
      }
      
      (CanvasContainer as HTMLElement).appendChild(AppCanvas);
      
      this._Screen = this.Instance.screen;
      
      this.attachToWindowResize();
      
      this.emit(PApp.EVENT_INITIALIZE_SUCCESS, this);
      
    } catch (e) {
      console.error('PApp:', e);
      
      this.emit(PApp.EVENT_INITIALIZE_FAILED, this);
      
    }
  }
  
  public resize() {
    
    this._Instance.stage.layout = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this._Instance.stage.layout?.forceUpdate();
    
    this.emit(PApp.EVENT_RESIZE, this); // effectively triggers Containers/Sprites resizing
  };
  
  //make it so that when the window resizes, the app resize alongside it.
  private attachToWindowResize() {
    const delayedResize = () => {
      setTimeout(this.resize.bind(this), 200);
    };
    
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('resize', delayedResize);
    window.addEventListener('orientationchange', this.resize.bind(this));
    window.addEventListener('orientationchange', delayedResize);
  }
  
  public addToStage(target: CContainer): any
  public addToStage(target: SSprite): any
  public addToStage(target: PIXI.Sprite): any
  public addToStage(target: PIXI.Container): any {
    
    this.Instance.stage.addChild(target);
    
    if (target instanceof SSprite || target instanceof CContainer)
      target.onAddedToStage(this);
    
    this.resize();
  };
  
  public removeFromStage(target: CContainer): any
  public removeFromStage(target: SSprite): any
  public removeFromStage(target: PIXI.Sprite): any
  public removeFromStage(target: PIXI.Container): any {
    
    this.Instance.stage.removeChild(target);
    
    if (target instanceof SSprite || target instanceof CContainer)
      target.onRemovedFromStage(this);
    
    this.resize();
  };
  
}