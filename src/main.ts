import * as PIXI from 'pixi.js';
import PApp from './core/PApp';

import CReel from './components/CReel.ts';
import CReelsWrapper from './components/CReelsWrapper.ts';
import PSlotsGameMode from './components/PSlotsGameMode.ts';
import PSlotsGameLevel from './components/PSlotsGameLevel.ts';
import CMainUI from './components/CMainUI.ts';
import CLoadingScreen from './components/CLoadingScreen.ts';

import { gsap } from 'gsap';


// ---config
const RENDER_TARGET_ID = 'pixi-render-target';
const LOADING_SCREEN_BG = '#313638';
const MAIN_SCREEN_BG = '#E0DFD5';
const MAIN_SCREEN_BG_RGB = [49, 54, 56, 1.0];
const SYMBOL_MAX_SIZE = 150;

// ---assets
const BundleManifest = {
  bundles: [
    {
      name: 'SlotsGameAssets',
      assets: [
        { alias: 'hv1', src: '/assets/hv1_symbol.png' },
        { alias: 'hv2', src: '/assets/hv2_symbol.png' },
        { alias: 'hv3', src: '/assets/hv3_symbol.png' },
        { alias: 'hv4', src: '/assets/hv4_symbol.png' },
        { alias: 'lv1', src: '/assets/lv1_symbol.png' },
        { alias: 'lv2', src: '/assets/lv2_symbol.png' },
        { alias: 'lv3', src: '/assets/lv3_symbol.png' },
        { alias: 'lv4', src: '/assets/lv4_symbol.png' },
        { alias: 'spinBtn', src: '/assets/spin_button.png' }
      ]
    }
  ]
};

// ---main logic
async function OnInitComplete(GameApp: PApp) {
  console.info('App Initialized');
  
  await PIXI.Assets.init({ manifest: BundleManifest });
  
  // prep main game
  const SlotsGameMode = new PSlotsGameMode();
  const SlotsLevel = new PSlotsGameLevel({ levelID: 'SlotGame' });
  const SlotsUI = new CMainUI({ isRenderGroup: true });
  SlotsUI.GameMode = SlotsGameMode;// spin function is a method of PSlotGameLevel
  
  // the loading screen
  const LoadingLevel = new PSlotsGameLevel({ levelID: 'Loading Level' });
  let loadingScreen = new CLoadingScreen();
  LoadingLevel.Container.addChild(loadingScreen);
  loadingScreen.addEventListener(CLoadingScreen.EVENT_START_CLICKED, () => {
    
    // switch to main level on clicking start
    if (bIsMainGameReady) {
      GameApp.CurrentLevel = SlotsLevel;
      // simple change changing effect
      // this sets semi-transparent color midway, so it will trigger a warning in color
      gsap.to(GameApp.Instance.renderer.background, {
        'color': MAIN_SCREEN_BG,
        duration: 1,
        ease: 'sine'
      });
    }
  });
  
  // priority load Loading Level
  GameApp.CurrentLevel = LoadingLevel;
  
  
  let bIsMainGameReady = false;// flag
  const lastProgress: number[] = [];
  let progressTimeOut: NodeJS.Timeout | null;
  PIXI.Assets.loadBundle('SlotsGameAssets', (progress) => {
    
    // a bit of a cheap trick to make sure the loading process is visible
    lastProgress.push(progress);
    if (!progressTimeOut) {
      const updateProgress = () => {
        if (!lastProgress.length) return;
        if (progressTimeOut) clearTimeout(progressTimeOut);
        const progressValue = lastProgress.shift() || 0;
        loadingScreen.CurrentProgress = (Math.round(progressValue * 100));
        progressTimeOut = setTimeout(updateProgress, 150);
      };
      
      progressTimeOut = setTimeout(updateProgress, 10);
    }
    
  })
    .then((loadedResources) => {
      // Initialize main game while loading screen shown
      const assetsDictionary = {
        hv1: loadedResources.hv1,
        hv2: loadedResources.hv2,
        hv3: loadedResources.hv3,
        hv4: loadedResources.hv4,
        lv1: loadedResources.lv1,
        lv2: loadedResources.lv2,
        lv3: loadedResources.lv3,
        lv4: loadedResources.lv4,
        btnSpin: loadedResources.spinBtn
      };
      
      const initializedSlotReels = initializeSlotReels(assetsDictionary);
      
      SlotsGameMode.ReelsWrapper = initializedSlotReels;
      SlotsLevel.Container.addChild(initializedSlotReels, SlotsUI);
      // set the ready flag
      bIsMainGameReady = true;
    })
    .catch((error) => {
      console.log('Asset loading failed, ', error);
    });
  
}

// --init failed
function OnInitFailed() {
  console.error('App Failed to initialize.');
}

function initializeSlotReels(assetsDictionary: {}) {
  const reelsWrapper = new CReelsWrapper();
  
  const ReelOne = new CReel();
  ReelOne.buildReel({
    bandIndex: 1,
    assetsDictionary: assetsDictionary,
    reelSet: ['hv2', 'lv3', 'lv3', 'hv1', 'hv1', 'lv1', 'hv1', 'hv4', 'lv1', 'hv3', 'hv2', 'hv3', 'lv4', 'hv4', 'lv1', 'hv2', 'lv4', 'lv1', 'lv3', 'hv2'],
    symbolMaxSize: SYMBOL_MAX_SIZE
  });
  
  const ReelTwo = new CReel();
  ReelTwo.buildReel({
    bandIndex: 2,
    assetsDictionary: assetsDictionary,
    reelSet: ['hv1', 'lv2', 'lv3', 'lv2', 'lv1', 'lv1', 'lv4', 'lv1', 'lv1', 'hv4', 'lv3', 'hv2', 'lv1', 'lv3', 'hv1', 'lv1', 'lv2', 'lv4', 'lv3', 'lv2'],
    symbolMaxSize: SYMBOL_MAX_SIZE
  });
  
  const ReelThree = new CReel();
  ReelThree.buildReel({
    bandIndex: 3,
    assetsDictionary: assetsDictionary,
    reelSet: ['lv1', 'hv2', 'lv3', 'lv4', 'hv3', 'hv2', 'lv2', 'hv2', 'hv2', 'lv1', 'hv3', 'lv1', 'hv1', 'lv2', 'hv3', 'hv2', 'hv4', 'hv1', 'lv2', 'lv4'],
    symbolMaxSize: SYMBOL_MAX_SIZE
  });
  
  const ReelFour = new CReel();
  ReelFour.buildReel({
    bandIndex: 4,
    assetsDictionary: assetsDictionary,
    reelSet: ['hv2', 'lv2', 'hv3', 'lv2', 'lv4', 'lv4', 'hv3', 'lv2', 'lv4', 'hv1', 'lv1', 'hv1', 'lv2', 'hv3', 'lv2', 'lv3', 'hv2', 'lv1', 'hv3', 'lv2'],
    symbolMaxSize: SYMBOL_MAX_SIZE
  });
  
  const ReelFive = new CReel();
  ReelFive.buildReel({
    bandIndex: 5,
    assetsDictionary: assetsDictionary,
    reelSet: ['lv3', 'lv4', 'hv2', 'hv3', 'hv4', 'hv1', 'hv3', 'hv2', 'hv2', 'hv4', 'hv4', 'hv2', 'lv2', 'hv4', 'hv1', 'lv2', 'hv1', 'lv2', 'hv4', 'lv4'],
    symbolMaxSize: SYMBOL_MAX_SIZE
  });
  
  reelsWrapper.addReels([ReelOne, ReelTwo, ReelThree, ReelFour, ReelFive]);
  
  return reelsWrapper;
}

(async () => {
  
  try {
    
    const GameApp = new PApp({
      baseScreenWidth: 1920,
      baseScreenHeight: 1080,
      renderTargetID: RENDER_TARGET_ID
    });
    
    GameApp.addListener(PApp.EVENT_INITIALIZE_SUCCESS, OnInitComplete);
    GameApp.addListener(PApp.EVENT_INITIALIZE_FAILED, OnInitFailed);
    
    await GameApp.Init({
      bgColor: LOADING_SCREEN_BG
    });
    
  } catch (e) {
    console.error('There is an error during initialization:', e);
  }
})();