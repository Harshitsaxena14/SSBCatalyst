import { ppdtCategory } from './ppdtData.js';
import { tatCategory } from './tatPrompts.js';
import { watCategory } from './watWords.js';
import { srtCategory } from './srtSituations.js';
import { sdCategory } from './sdData.js';

const toMap = (category) => {
  const map = {};
  (category.sets || []).forEach((set) => {
    map[set.id] = set;
  });
  return map;
};

export const datasetMap = {
  ppdt: toMap(ppdtCategory),
  tat: toMap(tatCategory),
  wat: toMap(watCategory),
  srt: toMap(srtCategory),
  sd: toMap(sdCategory),
};

export const categoryMap = {
  ppdt: ppdtCategory,
  tat: tatCategory,
  wat: watCategory,
  srt: srtCategory,
  sd: sdCategory,
};
