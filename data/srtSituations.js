import { srtSet1 } from './srt/set1.js';
import { srtSet2 } from './srt/set2.js';
import { srtSet3 } from './srt/set3.js';
import { srtSet4 } from './srt/set4.js';
import { srtSet5 } from './srt/set5.js';

export const srtCategory = {
  id: 'srt',
  short: 'SRT',
  tag: 'SITUATION TEST',
  title: 'Situation Reaction Test',
  description: 'React to practical situations with intelligence, balance, and officer-like judgement.',
  countsLabel: 'Situation bank',
  sets: [srtSet1, srtSet2, srtSet3, srtSet4, srtSet5],
};
