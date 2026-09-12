import { WorldEvent } from '../types';

export interface WorldEventTemplate {
  title: string;
  category: 'Economic' | 'Political' | 'Technological' | 'Military' | 'Covert';
  headline: string;
  description: string;
  creditMultiplier: number;
  intelMultiplier: number;
  tensionChange: number;
  baseDuration: number;
}

export const WORLD_EVENT_TEMPLATES: WorldEventTemplate[] = [
  {
    title: 'GLOBAL MARKET CRASH',
    category: 'Economic',
    headline: 'Megacorporate stock indices plunge 34% amidst debt defaults.',
    description: 'International banking networks freeze credit lines. Contract payouts are throttled, but desperation drives increased intelligence espionage leaks.',
    creditMultiplier: 0.65,
    intelMultiplier: 1.35,
    tensionChange: 12,
    baseDuration: 60,
  },
  {
    title: 'POLITICAL ASSASSINATION',
    category: 'Political',
    headline: 'Defense Minister assassinated by unidentified augmented hit-squad.',
    description: 'Panic sweeps diplomatic circles as rival factions blame each other. High-priority black-ops bounties and emergency security contracts flood the market.',
    creditMultiplier: 1.75,
    intelMultiplier: 1.5,
    tensionChange: 25,
    baseDuration: 55,
  },
  {
    title: 'QUANTUM AI BREAKTHROUGH',
    category: 'Technological',
    headline: 'Underground cyber-syndicate leaks quantum neural decryption keys.',
    description: 'Decentralized nodes crack encrypted diplomatic channels worldwide. Intelligence harvesting efficiency reaches unprecedented peaks.',
    creditMultiplier: 1.1,
    intelMultiplier: 2.25,
    tensionChange: 8,
    baseDuration: 60,
  },
  {
    title: 'DEFCON ESCALATION',
    category: 'Military',
    headline: 'Ballistic missile readiness raised across contested maritime zones.',
    description: 'Rival superstates scramble private military forces to fortify border outposts. Government defense funding surges to astronomical heights.',
    creditMultiplier: 1.9,
    intelMultiplier: 1.4,
    tensionChange: 30,
    baseDuration: 50,
  },
  {
    title: 'BLACK MARKET BOOM',
    category: 'Economic',
    headline: 'Global supply-chain interdictions fuel illegal arms trade surge.',
    description: 'Syndicates and oligarchs bypass trade embargoes using covert PMC escorts. Contracts pay out double hazard wages in liquid bullion.',
    creditMultiplier: 2.0,
    intelMultiplier: 0.9,
    tensionChange: -5,
    baseDuration: 65,
  },
  {
    title: 'GLOBAL SATELLITE EMP BLACKOUT',
    category: 'Covert',
    headline: 'Orbital EMP pulse disables primary military communication constellations.',
    description: 'Severe sensor interference forces tactical units to rely on manual visual reconnaissance. Intel transmissions suffer heavy loss packets.',
    creditMultiplier: 0.8,
    intelMultiplier: 0.5,
    tensionChange: 18,
    baseDuration: 45,
  },
  {
    title: 'CLANDESTINE CEASEFIRE ACCORDS',
    category: 'Political',
    headline: 'Secret multilateral truce signed in neutral orbital territory.',
    description: 'Open kinetic warfare halts temporarily; covert intelligence theft and double-agent extraction operations command peak premium rewards.',
    creditMultiplier: 0.75,
    intelMultiplier: 2.0,
    tensionChange: -22,
    baseDuration: 70,
  },
  {
    title: 'HYPER-INFLATION CRISIS',
    category: 'Economic',
    headline: 'Fiat reserve currencies collapse against decentralized commodity tokens.',
    description: 'Clients scramble to dump depreciating funds into private military contracts before market close, offering inflated hazard retainers.',
    creditMultiplier: 1.8,
    intelMultiplier: 1.1,
    tensionChange: 15,
    baseDuration: 55,
  },
  {
    title: 'BIOTECH LABORATORY LEAK',
    category: 'Technological',
    headline: 'Synthetic pathogen genome stolen from classified Arctic bio-vault.',
    description: 'Syndicates, cartels, and intelligence directorates race to secure counter-agent samples. Mercenary extraction bounties peak.',
    creditMultiplier: 1.6,
    intelMultiplier: 1.8,
    tensionChange: 20,
    baseDuration: 60,
  },
  {
    title: 'ROGUE GENERAL COUP ATTEMPT',
    category: 'Military',
    headline: 'Rebel armored division occupies state capital broadcast towers.',
    description: 'Civil war breaks out across regional sectors. Mercenaries are hired at premium rates for both regime protection and insurgent support.',
    creditMultiplier: 1.85,
    intelMultiplier: 1.6,
    tensionChange: 28,
    baseDuration: 55,
  },
];

export function generateRandomWorldEvent(existingEventId?: string): WorldEvent {
  const availableTemplates = WORLD_EVENT_TEMPLATES.filter(
    (t) => !existingEventId || t.title !== existingEventId
  );
  const template =
    availableTemplates[Math.floor(Math.random() * availableTemplates.length)] ||
    WORLD_EVENT_TEMPLATES[0];

  const now = Date.now();
  const duration = template.baseDuration + Math.floor(Math.random() * 20) - 5; // Slight duration variance

  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    title: template.title,
    category: template.category,
    headline: template.headline,
    description: template.description,
    creditMultiplier: template.creditMultiplier,
    intelMultiplier: template.intelMultiplier,
    tensionChange: template.tensionChange,
    durationSeconds: duration,
    startTime: now,
    expiresAt: now + duration * 1000,
  };
}
