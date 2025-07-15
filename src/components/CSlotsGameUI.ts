import * as PIXI from 'pixi.js';
import CContainer from '../core/CContainer.ts';
import PSlotsGameMode from './PSlotsGameMode.ts';
import SSymbolSprite from './SSymbolSprite.ts';
import { gsap } from 'gsap';

export default class CSlotsGameUI extends CContainer {
  
  public static readonly BTN_SPIN_SIZE = 180;
  
  private readonly _UIHeader: CContainer | undefined;
  private readonly _UIFooter: CContainer | undefined;
  private readonly _UIActionButtons: CContainer | undefined;
  
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
    
    this._UIActionButtons = new CContainer();
    this._UIActionButtons.label = 'Action Buttons';
    this._UIActionButtons.layout = {
      width: '100%',
      height: 'auto',
      // marginBottom: '15%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      justifyContent: 'center'
    };
    this._UIFooter.addChild(this._UIActionButtons);
    
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
  
  // fade and unfade the spin button(s)
  private onStartSpinning() {
    if (!this._UIActionButtons) return;
    gsap.to(this._UIActionButtons, {
      'alpha': 0.3,
      duration: .5
    });
  }
  
  private onFinishSpin() {
    if (!this._UIActionButtons) return;
    gsap.to(this._UIActionButtons, {
      'alpha': 1,
      duration: .25
    });
  }
  
  private addHeroText() {
    
    const heroText = new PIXI.Text({
      text: 'Pixi Slots Game Demo',
      style: {
        fontFamily: 'Arial Black, Impact, sans-serif',
        fontWeight: 'bold',
        stroke: {
          color: '#8B4513', // Dark brown border
          width: 5,
          join: 'round'
        },
        dropShadow: {
          color: '#000000',
          alpha: 6,
          blur: 8,
          angle: Math.PI / 6,
          distance: 4
        },
        fill: new PIXI.FillGradient({
          colorStops: [
            { offset: 0, color: '#FFD700' },
            { offset: 1, color: '#FFA500' }
          ]
        }),
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
        maxSize: CSlotsGameUI.BTN_SPIN_SIZE,
        texture: assets['spinBtn']
      });
      
      this._btnSpin.layout = true;
      
      // clicking
      this._btnSpin.cursor = 'pointer';
      this._btnSpin.eventMode = 'static';
      this._btnSpin.on('pointerdown', () => this.onSpinBtnClick());
      
      const testButtonStyles: PIXI.TextStyleOptions = {
        stroke: {
          color: '#000', // Dark brown border
          width: 5,
          join: 'round'
        },
        fill: '#ffffff',
        fontSize: 24
      };
      
      const btnTest_1 = new PIXI.Text({
        text: 'TEST 1',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_1.layout = true;
      
      const btnTest_2 = new PIXI.Text({
        text: 'TEST 2',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_2.layout = true;
      
      const btnTest_3 = new PIXI.Text({
        text: 'TEST 3',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_3.layout = true;
      
      const btnTest_4 = new PIXI.Text({
        text: 'TEST 4',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_4.layout = true;
      
      this._UIActionButtons?.addChild(btnTest_1, btnTest_2, this._btnSpin, btnTest_3, btnTest_4);
      
      
      const ResultText = new PIXI.Text({
        text: this._ResultText || '',
        style: {
          fill: '#ffffff',
          fontSize: 32
        },
        anchor: 0.5
      });
      ResultText.layout = true;
      
      this._UIFooter?.addChild(ResultText);
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