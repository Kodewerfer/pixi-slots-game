/**
 * a (P)ixi App (Level)
 * Abstract layer that serves as a general container
 * Functionally it is the same to a "page"
 * This is a middle-man layer that should not handle actual logic
 */
import EventEmitter from 'eventemitter3';
import '@pixi/layout';
import PApp from './PApp.ts';
import CContainer from './CContainer.ts';

export type TPLevelConstructParams = { levelID: string };
export default class PLevel extends EventEmitter {
  
  public static readonly EVENT_ACTIVE: string = 'ACTIVE';
  public static readonly EVENT_Dormant: string = 'DORMANT';
  
  
  public LevelID: string | undefined;
  
  protected GameApp: PApp | null = null;
  
  protected readonly LevelContainer = new CContainer();
  
  constructor({ levelID }: TPLevelConstructParams) {
    super();
    this.LevelID = levelID;
    
    this.LevelContainer.layout = {
      width: '100%',
      height: '100%'
    };
    this.LevelContainer.label = `Level ${this.LevelID}`;
  }
  
  
  get Container() {
    return this.LevelContainer;
  }
  
  
  public onActive(GameApp: PApp) {
    this.GameApp = GameApp;
    
    GameApp.addToStage(this.LevelContainer!);
    this.emit(PLevel.EVENT_ACTIVE, this);
  }
  
  
  public onDormant(GameApp: PApp) {
    GameApp.removeFromStage(this.LevelContainer!);
    this.emit(PLevel.EVENT_Dormant, this);
  }
}