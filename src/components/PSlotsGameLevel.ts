import PLevel, { TPLevelConstructParams } from '../core/PLevel.ts';

// effectively a "page"
export default class PSlotsGameLevel extends PLevel {
  // only to provide layout
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