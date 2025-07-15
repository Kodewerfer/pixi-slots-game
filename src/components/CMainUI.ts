import * as PIXI from 'pixi.js';
import CContainer from '../core/CContainer.ts';
import PSlotsGameMode from './PSlotsGameMode.ts';
import SSymbolSprite from './SSymbolSprite.ts';
import { gsap } from 'gsap';

// the UI class is not using layout to achieve a "positioning:absolute" type of effect.
export default class CMainUI extends CContainer {
  
  public static readonly BTN_SPIN_SIZE = 180;
  
  private readonly _UIHeader: CContainer | undefined;
  private readonly _UIFooter: CContainer | undefined;
  
  private _GameMode: PSlotsGameMode | undefined;
  
  private _ResultText: string | undefined;
  
  private _btnSpin: SSymbolSprite | undefined;
  
  
  constructor(options?: PIXI.ContainerOptions<PIXI.ContainerChild>) {
    super(options);
    this.label = 'Slots UI';
    
    this.pivot = 0.5;
    
    this.layout = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      transformOrigin: 'center'
    };
    
    this._UIHeader = new CContainer({ scaleWithBaseRes: true });
    this._UIHeader.label = 'UI_HEADER';
    this._UIHeader.layout = {
      position: 'absolute',
      width: '100%',
      height: 'auto',
      marginTop: '5%',
      top: 0,
      flexDirection: 'column',
      alignItems: 'center'
    };
    
    this._UIFooter = new CContainer({ scaleWithBaseRes: true });
    this._UIFooter.label = 'UI_FOOTER';
    this._UIFooter.layout = {
      position: 'absolute',
      width: '100%',
      height: 'auto',
      marginBottom: '15%',
      bottom: 0,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      justifyContent: 'space-around'
    };
    
    this.addChild(this._UIHeader, this._UIFooter);
    
    this.addHeroText();
    this.setUpSpinButtonAndResult();
    
    this.reScaleWithBaseRes();
    
  }
  
  set ResultText(resultText: string) {
    this._ResultText = resultText;
  }
  
  set GameMode(value: PSlotsGameMode) {
    this._GameMode = value;
    
    this._GameMode.addListener(PSlotsGameMode.EVEN_SPIN_STARTED, this.onStartSpinning.bind(this));
    this._GameMode.addListener(PSlotsGameMode.EVEN_SPIN_FINISHED, this.onFinishSpin.bind(this));
  }
  
  private onStartSpinning() {
    if (!this._btnSpin) return;
    gsap.to(this._btnSpin, {
      'alpha': 0.3,
      duration: .5
    });
  }
  
  private onFinishSpin() {
    if (!this._btnSpin) return;
    gsap.to(this._btnSpin, {
      'alpha': 1,
      duration: .25
    });
  }
  
  private addHeroText() {
    
    const heroText = new PIXI.Text({
      text: 'Pixi Slots Game Demo',
      style: {
        stroke: { color: '#000', width: 4, join: 'round' },
        fill: '#ffffff',
        fontSize: 36
      },
      anchor: 0.5
    });
    heroText.layout = true;
    
    this._UIHeader?.addChild(heroText);
    
  }
  
  
  private setUpSpinButtonAndResult() {
    
    // this should finish immediately
    PIXI.Assets.loadBundle('SlotsGameAssets').then((assets) => {
      
      this._btnSpin = new SSymbolSprite({
        symbolName: 'btnSpin',
        maxSize: CMainUI.BTN_SPIN_SIZE,
        texture: assets['spinBtn']
      });
      
      this._btnSpin.layout = true;
      
      // clicking
      this._btnSpin.cursor = 'pointer';
      this._btnSpin.eventMode = 'static';
      this._btnSpin.on('pointerdown', () => this.onSpinBtnClick());
      
      
      const ResultText = new PIXI.Text({
        text: this._ResultText || '',
        style: {
          fill: '#ffffff',
          fontSize: 26
        },
        anchor: 0.5
      });
      ResultText.layout = true;
      
      this._UIFooter?.addChild(this._btnSpin, ResultText);
    });
    
  }
  
  private onSpinBtnClick() {
    if (!this._GameMode) {
      console.error('UI:GameMode not set.');
      return;
    }
    this._GameMode.StartSpinning();
  }
  
  onAddedToStage(GameApp: any) {
    super.onAddedToStage(GameApp);
  }
  
  protected onResize() {
    super.onResize();
  }
}