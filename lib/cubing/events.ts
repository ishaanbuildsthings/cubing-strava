// All supported WCA events (excluding FMC and MBLD).
// Enum values match cubing.js's randomScrambleForEvent() parameter.
export enum CubeEvent {
  TWO = "222",
  THREE = "333",
  FOUR = "444",
  FIVE = "555",
  SIX = "666",
  SEVEN = "777",
  THREE_BLD = "333bf",
  FOUR_BLD = "444bf",
  FIVE_BLD = "555bf",
  OH = "333oh",
  PYRA = "pyram",
  MEGA = "mega",
  SKEWB = "skewb",
  SQ1 = "sq1",
  CLOCK = "clock",
}

export interface EventMeta {
  id: CubeEvent;
  name: string;
  // BLD events use mean-of-3 instead of averages (DNFs are too common
  // for trimmed averages to make sense).
  useMo3: boolean;
}

export const EVENTS_LIST: EventMeta[] = [
  { id: CubeEvent.TWO, name: "2x2", useMo3: false },
  { id: CubeEvent.THREE, name: "3x3", useMo3: false },
  { id: CubeEvent.FOUR, name: "4x4", useMo3: false },
  { id: CubeEvent.FIVE, name: "5x5", useMo3: false },
  { id: CubeEvent.SIX, name: "6x6", useMo3: false },
  { id: CubeEvent.SEVEN, name: "7x7", useMo3: false },
  { id: CubeEvent.THREE_BLD, name: "3BLD", useMo3: true },
  { id: CubeEvent.FOUR_BLD, name: "4BLD", useMo3: true },
  { id: CubeEvent.FIVE_BLD, name: "5BLD", useMo3: true },
  { id: CubeEvent.OH, name: "OH", useMo3: false },
  { id: CubeEvent.PYRA, name: "Pyra", useMo3: false },
  { id: CubeEvent.MEGA, name: "Mega", useMo3: false },
  { id: CubeEvent.SKEWB, name: "Skewb", useMo3: false },
  { id: CubeEvent.SQ1, name: "SQ-1", useMo3: false },
  { id: CubeEvent.CLOCK, name: "Clock", useMo3: false },
];

export const EVENT_MAP: Record<CubeEvent, EventMeta> = Object.fromEntries(
  EVENTS_LIST.map((e) => [e.id, e])
) as Record<CubeEvent, EventMeta>;

export function getEventMeta(event: CubeEvent): EventMeta {
  return EVENT_MAP[event];
}
