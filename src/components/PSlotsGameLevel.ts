import PLevel, { TPLevelConstructParams } from '../core/PLevel.ts';

export default class PSlotsGameLevel extends PLevel {
  // serve as the page after loading
  
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