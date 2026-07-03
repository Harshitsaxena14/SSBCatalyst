import { ppdtSet1 } from './ppdt/set1.js';
import { ppdtSet2 } from './ppdt/set2.js';
import { ppdtSet3 } from './ppdt/set3.js';
import { ppdtSet4 } from './ppdt/set4.js';
import { ppdtSet5 } from './ppdt/set5.js';

export const ppdtCategory = {
  id: 'ppdt',
  short: 'PPDT',
  tag: 'PICTURE TEST',
  title: 'Picture Perception & Discussion Test',
  description: 'Practice PPDT observation, narrative and rescue responses under timed conditions.',
  countsLabel: 'Images per set',
  sets: [ppdtSet1, ppdtSet2, ppdtSet3, ppdtSet4, ppdtSet5],
};
import { chunkArray, createMockImageUrl } from './shared.js';

const ppdtImageSpecs = [
  {
    title: 'Harbor Rescue',
    subtitle: 'Crowded dock, rescue boat, and a calm signal from the pier',
    label: 'PPDT 01',
    from: '#0f172a',
    to: '#0ea5e9',
    characterCount: 6,
    mood: 'Urgent but composed',
    scenarioHint: 'A rescue team is organizing people near a water edge.',
  },
  {
    title: 'School Crossing',
    subtitle: 'Morning traffic, students, and a volunteer guiding movement',
    label: 'PPDT 02',
    from: '#111827',
    to: '#2563eb',
    characterCount: 5,
    mood: 'Alert and orderly',
    scenarioHint: 'A safety-focused scene at a busy school gate.',
  },
  {
    title: 'Village Water Point',
    subtitle: 'Queue of containers, helper speaking, and a dusty lane',
    label: 'PPDT 03',
    from: '#111827',
    to: '#14b8a6',
    characterCount: 7,
    mood: 'Cooperative and hopeful',
    scenarioHint: 'A community queue needs coordination and patience.',
  },
  {
    title: 'Railway Platform Delay',
    subtitle: 'Delayed train, mixed crowd, and an officer calming the platform',
    label: 'PPDT 04',
    from: '#1e293b',
    to: '#0f766e',
    characterCount: 6,
    mood: 'Tense but manageable',
    scenarioHint: 'Crowd control and practical direction are needed.',
  },
  {
    title: 'Flood Relief Coordination',
    subtitle: 'Waterlogged street, supply truck, and volunteers moving fast',
    label: 'PPDT 05',
    from: '#0f172a',
    to: '#0284c7',
    characterCount: 8,
    mood: 'Serious and service-minded',
    scenarioHint: 'Relief work and rescue coordination are taking shape.',
  },
  {
    title: 'Workshop Fire Drill',
    subtitle: 'Workshop floor, alarm light, and workers creating space quickly',
    label: 'PPDT 06',
    from: '#111827',
    to: '#f97316',
    characterCount: 5,
    mood: 'Fast and disciplined',
    scenarioHint: 'A fire drill with quick evacuation and calm leadership.',
  },
  {
    title: 'Mountain Trek Rest Stop',
    subtitle: 'Trek team, resting hikers, and a guide checking the path',
    label: 'PPDT 07',
    from: '#0f172a',
    to: '#22c55e',
    characterCount: 6,
    mood: 'Steady and resilient',
    scenarioHint: 'A trekking group is recovering and moving smartly.',
  },
  {
    title: 'Roadside First Aid',
    subtitle: 'Vehicle halted, helper kneeling, and a bystander calling support',
    label: 'PPDT 08',
    from: '#111827',
    to: '#ef4444',
    characterCount: 7,
    mood: 'Concerned and active',
    scenarioHint: 'A road emergency needs first aid and coordination.',
  },
  {
    title: 'Campus Protest Calm',
    subtitle: 'Students gathered, a mediator speaking, and security observing',
    label: 'PPDT 09',
    from: '#0f172a',
    to: '#7c3aed',
    characterCount: 6,
    mood: 'Measured and diplomatic',
    scenarioHint: 'A tense but manageable college situation.',
  },
  {
    title: 'Bus Breakdown Support',
    subtitle: 'Broken bus, passengers waiting, and a helper directing options',
    label: 'PPDT 10',
    from: '#0f172a',
    to: '#f59e0b',
    characterCount: 5,
    mood: 'Practical and calm',
    scenarioHint: 'An unexpected transport issue needs clear action.',
  },
];

export const ppdtImages = ppdtImageSpecs.map((spec, index) => ({
  id: `ppdt-${index + 1}`,
  imageUrl: createMockImageUrl(spec),
  characterCount: spec.characterCount,
  mood: spec.mood,
  scenarioHint: spec.scenarioHint,
  title: spec.title,
  subtitle: spec.subtitle,
}));

export const ppdtPracticeSets = chunkArray(ppdtImages, 2).map((items, index) => ({
  id: `set-${index + 1}`,
  title: [
    'Harbor to Order',
    'Safety and Control',
    'Community Action',
    'Crowd and Calm',
    'Service Under Pressure',
  ][index],
  description: [
    'Practice early observation, quick narrative framing, and calm leadership cues.',
    'Build stories around safety, traffic awareness, and disciplined action.',
    'Work through a cooperative story arc with socially useful outcomes.',
    'Train judgment under crowd pressure and bring structure without force.',
    'Finish with rescue, service, and practical problem solving under pressure.',
  ][index],
  duration: '30s image + response block',
  difficulty: ['Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Advanced'][index],
  countLabel: `${items.length} images`,
  thumbnail: {
    label: `Set 0${index + 1}`,
    from: ['#0f172a', '#111827', '#0f172a', '#1e293b', '#0f172a'][index],
    to: ['#0ea5e9', '#2563eb', '#14b8a6', '#0f766e', '#0284c7'][index],
  },
  items,
  routeSlug: `/practice/ppdt/set-${index + 1}`,
}));

export const ppdtCategory = {
  id: 'ppdt',
  short: 'PPDT',
  tag: 'SCREENING TEST',
  title: 'Picture Perception & Description Test',
  description: 'Practice hazy-picture narration, observation, and confidence under pressure.',
  countsLabel: 'Image set',
  sets: ppdtPracticeSets,
};
