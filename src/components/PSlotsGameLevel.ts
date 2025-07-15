import PLevel, { TPLevelConstructParams } from '../core/PLevel.ts';

// effectively a "page"
export default class PSlotsGameLevel extends PLevel {
  // this primarily use layout the position elements,
  // by design, they should have hold any actual logic (the logic should be in "GameMode" which only handles logic)
  constructor({ ...options }: TPLevelConstructParams) {
    super(options);
    
    this.LevelContainer!.layout = {
      transformOrigin: 'center',
      justifyContent: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      overflow: 'hidden'
    };
    
  }
  
}