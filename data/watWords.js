import { watSet1 } from './wat/set1.js';
import { watSet2 } from './wat/set2.js';
import { watSet3 } from './wat/set3.js';
import { watSet4 } from './wat/set4.js';
import { watSet5 } from './wat/set5.js';

export const watCategory = {
  id: 'wat',
  short: 'WAT',
  tag: 'WORD TEST',
  title: 'Word Association Test',
  description: 'Practice fast, positive, and original responses under 15-second flashes.',
  countsLabel: 'Word bank',
  sets: [watSet1, watSet2, watSet3, watSet4, watSet5],
};
