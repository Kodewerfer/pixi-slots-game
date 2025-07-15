import CContainer from '../core/CContainer.ts';
import * as PIXI from 'pixi.js';
import { Ticker } from 'pixi.js';

export default class CLoadingScreen extends CContainer {
  
  public static readonly EVENT_START_CLICKED: string = 'START_CLICKED';
  
  private _ProgressNumber: number = 0;
  private _bReadyToStart: boolean = false;
  
  private _LoadingTextContainer = new CContainer({ scaleWithBaseRes: true });
  private _ProgressText: PIXI.Text | undefined;
  private _BtnStart: PIXI.Text | undefined;
  
  constructor(options?: PIXI.ContainerOptions<PIXI.ContainerChild>) {
    super(options);
    
    this.label = 'Loading Screen';
    
    this.pivot = 0.5;
    
    this.layout = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      flexDirection: 'column',
      alignItems: 'center',
      transformOrigin: 'center',
      justifyContent: 'center',
      gap: 10
    };
    
    this._LoadingTextContainer.layout = {
      width: '100%',
      height: 'intrinsic',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    };
    this.addChild(this._LoadingTextContainer);
    
    this.addLoadingTexts();
    this.addBtnStart();
    
    this.reScaleWithBaseRes();
    
  }
  
  set CurrentProgress(progress: number) {
    this._ProgressNumber = progress;
    this._ProgressText!.text = this._ProgressNumber + '%';
  }
  
  private addLoadingTexts() {
    
    const loadingText = new PIXI.Text({
      text: 'Loading ...',
      style: {
        stroke: { color: '#000', width: 4, join: 'round' },
        fill: '#ffffff',
        fontSize: 27
      },
      anchor: 0.5
    });
    loadingText.layout = true;
    
    this._ProgressText = new PIXI.Text({
      text: this._ProgressNumber + '%',
      pivot: 0.5,
      style: {
        stroke: { color: '#000', width: 4, join: 'round' },
        fill: '#ffffff',
        fontSize: 27
      }
    });
    this._ProgressText.layout = true;
    
    this._LoadingTextContainer.addChild(loadingText, this._ProgressText);
    
  }
  
  private addBtnStart() {
    const btnStart = new PIXI.Text({
      text: 'Start',
      style: {
        stroke: { color: '#000', width: 4, join: 'round' },
        fill: '#ffffff',
        fontSize: 38,
        dropShadow: {
          color: '#000000',
          blur: 4,
          angle: Math.PI / 6,
          distance: 4
        }
      },
      anchor: 0.5
    });
    btnStart.layout = true;
    
    btnStart.alpha = 0;
    
    this._BtnStart = btnStart;
    this.addChild(this._BtnStart);
  }
  
  private activateBtnStart() {
    this._BtnStart!.alpha = 1;
    this._BtnStart!.cursor = 'pointer';
    this._BtnStart!.eventMode = 'static';
    this._BtnStart!.on('pointerdown', () => this.onStartBtnClick());
  }
  
  private onStartBtnClick() {
    this.emit(CLoadingScreen.EVENT_START_CLICKED, this);
  }
  
  protected onTick(ticker: Ticker) {
    super.onTick(ticker);
    
    if (this._ProgressNumber >= 100 && this._BtnStart && !this._bReadyToStart) {
      this._bReadyToStart = true;
      this.activateBtnStart();
    }
  }
  
  protected onResize() {
    super.onResize();
    this.reScaleWithBaseRes();
  }
  
}