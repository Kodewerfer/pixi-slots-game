import * as PIXI from 'pixi.js';
import CContainer from '../core/CContainer.ts';
import PSlotsGameMode from './PSlotsGameMode.ts';
import SSymbolSprite from './SSymbolSprite.ts';
import { gsap } from 'gsap';

export default class CSlotsGameUI extends CContainer {
  
  public static readonly BTN_SPIN_SIZE = 180;
  
  public static readonly _UI_SHORTSCREEN_BREAKPOINT = 800;
  public static readonly _UI_TALLSCREEN_BREAKPOINT = 1200;
  
  // used in onResize()
  public static readonly _UIFOOTER_MARGIN_B_SHORTSCREEN = '-10%';
  public static readonly _UIFOOTER_MARGIN_B_NORMAL = '0%';
  public static readonly _UIFOOTER_MARGIN_B_TALLSCREEN = '6%';
  
  private _UIHeader: CContainer | undefined;
  private _UIFooter: CContainer | undefined;
  private _UIActionButtons: CContainer | undefined;
  
  private _GameMode: PSlotsGameMode | undefined;
  
  private _ResultText: PIXI.Text | undefined;
  
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
    
    this.setUpUIContainers();
    
    this.addHeroText();
    this.setUpSpinButtonAndResultText();
    
    this.reScaleWithBaseRes();
    
  }
  
  
  set GameMode(value: PSlotsGameMode) {
    this._GameMode = value;
    
    this._GameMode.addListener(PSlotsGameMode.EVEN_SPIN_STARTED, this.onStartSpinning.bind(this));
    this._GameMode.addListener(PSlotsGameMode.EVEN_SPIN_FINISHED, this.onFinishSpin.bind(this));
  }
  
  
  private setUpUIContainers() {
    
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
      marginBottom: CSlotsGameUI._UIFOOTER_MARGIN_B_NORMAL,
      bottom: 0,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      justifyContent: 'center'
    };
    
    this._UIActionButtons = new CContainer();
    this._UIActionButtons.label = 'Action Buttons';
    this._UIActionButtons.layout = {
      width: '100%',
      height: 'auto',
      flexShrink: 0,
      flexGrow: 0,
      // marginBottom: '15%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      justifyContent: 'center'
    };
    this._UIFooter.addChild(this._UIActionButtons);
    
    this.addChild(this._UIHeader, this._UIFooter);
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
  
  private setUpSpinButtonAndResultText() {
    
    // this should finish immediately
    PIXI.Assets.loadBundle('SlotsGameAssets').then((assets) => {
      
      this._btnSpin = new SSymbolSprite({
        symbolName: 'btnSpin',
        maxSize: CSlotsGameUI.BTN_SPIN_SIZE,
        texture: assets['spinBtn']
      });
      
      this._btnSpin.layout = {
        flexShrink: 0
      };
      
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
      
      // -- test buttons
      const btnTest_1 = new PIXI.Text({
        text: 'RESET',
        style: {
          ...testButtonStyles,
          fill: '#EF6461'
        },
        anchor: 0.5
      });
      btnTest_1.cursor = 'pointer';
      btnTest_1.eventMode = 'static';
      btnTest_1.layout = true;
      btnTest_1.on('pointerdown', () => this.onSpinBtnClick({ toPositions: [0, 0, 0, 0, 0] }));
      
      const btnTest_2 = new PIXI.Text({
        text: 'TEST 2',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_2.cursor = 'pointer';
      btnTest_2.eventMode = 'static';
      btnTest_2.layout = true;
      btnTest_2.on('pointerdown', () => this.onSpinBtnClick({ toPositions: [5, 14, 9, 9, 16] }));
      
      const btnTest_3 = new PIXI.Text({
        text: 'TEST 3',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_3.cursor = 'pointer';
      btnTest_3.eventMode = 'static';
      btnTest_3.layout = true;
      btnTest_3.on('pointerdown', () => this.onSpinBtnClick({ toPositions: [1, 16, 2, 15, 0] }));
      
      const btnTest_4 = new PIXI.Text({
        text: 'TEST 4',
        style: testButtonStyles,
        anchor: 0.5
      });
      btnTest_4.cursor = 'pointer';
      btnTest_4.eventMode = 'static';
      btnTest_4.layout = true;
      btnTest_4.on('pointerdown', () => this.onSpinBtnClick({ toPositions: [18, 9, 2, 0, 12] }));
      // -- test buttons
      
      
      this._UIActionButtons?.addChild(btnTest_1, btnTest_2, this._btnSpin, btnTest_3, btnTest_4);
      
      // the text default value is non-visible whitespace that won't be trimmed as placeholder
      // otherwise risking UI flickering.
      const ResultText = new PIXI.Text({
        text: '\u200B\n\u200B\n\u200B\n\u200B\n\u200B\n\u200B\n\u200B',
        style: {
          fill: '#ffffff',
          stroke: {
            color: '#000', // Dark brown border
            width: 5,
            join: 'round'
          },
          fontSize: 24
        },
        anchor: 0.5
      });
      // ResultText.alpha = 0;
      ResultText.layout = true;
      this._ResultText = ResultText;
      
      this._UIFooter?.addChild(ResultText);
    });
    
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
    this.refreshResultTextByLatestResult();
  }
  
  private refreshResultTextByLatestResult() {
    let spinResult = this._GameMode?.LastestSpinResultProcessed;
    
    if (!spinResult || !this._ResultText) return;
    
    let finalText = '';
    
    
    let numEmptyLines = 0;
    spinResult.map((lineResult, arrayIndex) => {
      
      if (!lineResult.points) { //empty result
        numEmptyLines++;
        return;
      }
      
      // if point exist there must be a symbol as key
      const symbolName = Object.keys(lineResult)[0];
      
      finalText += `\nPayline${arrayIndex + 1} :  ${symbolName}  x  ${lineResult[symbolName]},  Points: ${lineResult.points}`;
      
    });
    
    // pad the text with empty lines so the styling won't break and UI won't flicker
    for (let i = 0; i < numEmptyLines; i++) {
      finalText += '\n\u200B';
    }
    
    this._ResultText.text = finalText.trim(); //removes the br from start of the text
    this._ResultText.alpha = 1; //if not already shown
  }
  
  private onSpinBtnClick({ toPositions }: { toPositions?: [number, number, number, number, number] } = {}) {
    if (!this._GameMode) {
      console.error('UI:GameMode not set.');
      return;
    }
    this._GameMode.StartSpinning({ 'toPositions': toPositions });
  }
  
  // re-calc and set the footer UI's position
  protected onResize() {
    super.onResize();
    
    const screenHeight = this.GameApp?.Screen?.height;
    
    // effectively responsive breakpoints
    // footer will be placed too high as to cover the main area otherwise
    if (!this._UIFooter || !screenHeight) return;
    
    if (screenHeight <= CSlotsGameUI._UI_SHORTSCREEN_BREAKPOINT)
      this._UIFooter.layout = {
        marginBottom: CSlotsGameUI._UIFOOTER_MARGIN_B_SHORTSCREEN
      };
    
    else if (screenHeight >= CSlotsGameUI._UI_TALLSCREEN_BREAKPOINT)
      this._UIFooter.layout = {
        marginBottom: CSlotsGameUI._UIFOOTER_MARGIN_B_TALLSCREEN
      };
    
    else
      this._UIFooter.layout = {
        marginBottom: CSlotsGameUI._UIFOOTER_MARGIN_B_NORMAL
      };
  }
}