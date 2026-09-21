export type DrillCategory =
  | 'stance'
  | 'footwork'
  | 'power'
  | 'balance'
  | 'guard'
  | 'athleticism'

export interface Drill {
  id: string
  title: string
  category: DrillCategory
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  summary: string
  steps: string[]
  /** Issue tags this drill helps fix — matched against feedback engine output. */
  tags: string[]
}

export const DRILL_CATEGORY_LABEL: Record<DrillCategory, string> = {
  stance: 'Stance',
  footwork: 'Footwork',
  power: 'Power & Explosiveness',
  balance: 'Balance & Control',
  guard: 'Guard & Upper Body',
  athleticism: 'General Athleticism',
}

export const DRILLS: Drill[] = [
  {
    id: 'athletic-stance-hold',
    title: 'Athletic Stance Hold',
    category: 'stance',
    level: 'beginner',
    duration: '3 x 30s',
    summary:
      'Builds the muscle memory for a balanced, ready-to-move base — feet just outside shoulder width, knees soft.',
    steps: [
      'Set feet slightly wider than shoulder width, toes pointed slightly out.',
      'Bend knees until you feel tension in your thighs, chest up, weight on the balls of your feet.',
      'Hold the position for 30 seconds, breathing normally, resisting the urge to stand up.',
      'Rest 20 seconds and repeat for 3 rounds.',
    ],
    tags: ['stance_narrow', 'stance_wide', 'knee_straight'],
  },
  {
    id: 'wall-sit-hold',
    title: 'Wall Sit',
    category: 'stance',
    level: 'beginner',
    duration: '3 x 30-45s',
    summary: 'Strengthens the quads and grooves a deeper, more powerful knee bend without collapsing your stance.',
    steps: [
      'Back flat against a wall, slide down until knees are near 90 degrees.',
      'Keep knees tracking over your toes, weight even on both feet.',
      'Hold, then slide back up slowly.',
    ],
    tags: ['knee_straight'],
  },
  {
    id: 'lateral-shuffle',
    title: 'Lateral Defensive Shuffle',
    category: 'footwork',
    level: 'beginner',
    duration: '4 x 20s',
    summary: 'Trains quick, controlled side-to-side steps while keeping your stance width and posture intact.',
    steps: [
      'Start in your athletic stance with two cones or markers 4-6 feet apart.',
      'Shuffle sideways step-slide (never crossing your feet) to one marker, then back.',
      'Keep your chest up and stance width consistent the entire time — do not let feet drift together.',
      'Go for 20 seconds, rest 20, repeat.',
    ],
    tags: ['footwork_low', 'stance_narrow'],
  },
  {
    id: 'ladder-quick-feet',
    title: 'Agility Ladder — Quick Feet',
    category: 'footwork',
    level: 'intermediate',
    duration: '5 x 10s',
    summary: 'Raises foot speed and coordination, directly increasing your footwork activity and step cadence.',
    steps: [
      'Lay out an agility ladder (or tape lines 18 inches apart on the floor).',
      'Run through placing one foot in each square as fast as you can with control.',
      'Focus on quiet, light foot strikes — not stomping.',
      'Walk back to the start and repeat 5 times.',
    ],
    tags: ['footwork_low', 'cadence_low'],
  },
  {
    id: 'reaction-step-drill',
    title: 'Reactive Step Drill',
    category: 'footwork',
    level: 'intermediate',
    duration: '6 x 15s',
    summary: 'A partner or app calls out a direction — you react and step, building game-speed footwork.',
    steps: [
      'Start in your ready stance.',
      'Have a partner call "left", "right", "forward", or "back" at random.',
      'React with a single quick step in that direction, then reset to stance.',
      'Keep reps short and explosive — quality over quantity.',
    ],
    tags: ['footwork_low', 'cadence_low'],
  },
  {
    id: 'broad-jumps',
    title: 'Broad Jumps',
    category: 'power',
    level: 'intermediate',
    duration: '4 x 5 reps',
    summary: 'Builds explosive hip and leg drive — the same triple extension that powers strikes, sprints, and cuts.',
    steps: [
      'From an athletic stance, swing your arms back and load your hips and knees.',
      'Explode forward, jumping as far as you can, and land softly in a balanced stance.',
      'Reset fully between reps — this is about max effort, not speed.',
    ],
    tags: ['power_low'],
  },
  {
    id: 'squat-jumps',
    title: 'Squat Jumps',
    category: 'power',
    level: 'beginner',
    duration: '4 x 8 reps',
    summary: 'Trains your legs to convert a deep knee bend into explosive upward force — core to punching and kicking power.',
    steps: [
      'Lower into a squat with knees bent well past 90 degrees.',
      'Explode straight up as high as possible, swinging arms overhead.',
      'Land soft with bent knees and immediately reset your stance.',
    ],
    tags: ['power_low', 'knee_straight'],
  },
  {
    id: 'medicine-ball-rotational-throw',
    title: 'Rotational Med Ball Throw',
    category: 'power',
    level: 'intermediate',
    duration: '3 x 8 each side',
    summary: 'Develops hip-and-torso rotational power that transfers directly into punching, throwing, and swinging power.',
    steps: [
      'Stand side-on to a wall holding a medicine ball at your hip.',
      'Rotate your hips and torso explosively, throwing the ball into the wall.',
      'Catch the rebound and reset — focus on driving power from the ground up through your hips.',
    ],
    tags: ['power_low'],
  },
  {
    id: 'single-leg-balance',
    title: 'Single-Leg Balance Hold',
    category: 'balance',
    level: 'beginner',
    duration: '3 x 30s each leg',
    summary: 'Improves ankle and core stability so your base stays quiet instead of swaying or bobbing.',
    steps: [
      'Stand on one leg with a soft bend in the knee, hands on hips.',
      'Hold as still as possible for 30 seconds, resisting side-to-side sway.',
      'Switch legs. Progress by closing your eyes or standing on a pillow.',
    ],
    tags: ['sway_high', 'bounce_high'],
  },
  {
    id: 'core-plank-series',
    title: 'Core Plank Series',
    category: 'balance',
    level: 'beginner',
    duration: '3 rounds',
    summary: 'A stronger core keeps your torso stacked over your base instead of leaning or collapsing under fatigue.',
    steps: [
      'Front plank: 30-40 seconds, hips level, no sagging.',
      'Side plank: 20-30 seconds each side.',
      'Dead bug: 8 slow reps each side, keeping your low back flat.',
    ],
    tags: ['lean_high', 'sway_high'],
  },
  {
    id: 'controlled-level-changes',
    title: 'Controlled Level Changes',
    category: 'balance',
    level: 'intermediate',
    duration: '3 x 8 reps',
    summary: 'Trains you to drop your center of mass smoothly instead of bobbing, so you stay ready to react at any height.',
    steps: [
      'From your stance, smoothly bend your knees to drop 6-8 inches straight down.',
      'Pause for a full second at the bottom, staying balanced.',
      'Rise back to your stance with control — no bouncing.',
    ],
    tags: ['bounce_high'],
  },
  {
    id: 'guard-up-shadow',
    title: 'Guard-Up Shadow Rounds',
    category: 'guard',
    level: 'beginner',
    duration: '3 x 1 min',
    summary: 'Grooves the habit of keeping your hands up near your chin instead of letting them drift down.',
    steps: [
      'Shadow box at slow-medium pace, keeping both hands within a few inches of your chin/cheek at all times.',
      'Every time you throw, snap the hand back to guard immediately.',
      'If you notice fatigue causing your hands to drop, reset your stance and reduce pace, not guard height.',
    ],
    tags: ['guard_low'],
  },
  {
    id: 'elbow-tuck-drill',
    title: 'Elbow-Tuck Awareness Drill',
    category: 'guard',
    level: 'beginner',
    duration: '3 x 1 min',
    summary: 'Reduces exposure by keeping your elbows close to your ribs instead of flaring out.',
    steps: [
      'In front of a mirror, hold your guard and consciously pull elbows in toward your ribcage.',
      'Move your head and shift weight side to side while keeping elbows tucked.',
      'Add light shadow punches, resetting elbows tight after every strike.',
    ],
    tags: ['elbow_flare'],
  },
  {
    id: 'jump-rope-intervals',
    title: 'Jump Rope Intervals',
    category: 'athleticism',
    level: 'beginner',
    duration: '6 x 45s',
    summary: 'Builds foot speed, rhythm, and conditioning that carries over into every category — footwork, balance, and power.',
    steps: [
      'Jump rope at a relaxed, rhythmic pace for 45 seconds.',
      'Rest 15 seconds.',
      'Repeat for 6 rounds, focusing on light, quiet landings on the balls of your feet.',
    ],
    tags: ['footwork_low', 'cadence_low', 'bounce_high'],
  },
  {
    id: 'sprint-starts',
    title: 'Acceleration Starts',
    category: 'athleticism',
    level: 'advanced',
    duration: '6 x 10m',
    summary: 'Trains raw explosiveness and first-step quickness from a athletic ready position.',
    steps: [
      'From your athletic stance, sprint explosively for 10 meters.',
      'Focus on a powerful first step and staying low for the first few strides.',
      'Walk back to recover fully between reps — this is about max quality, not volume.',
    ],
    tags: ['power_low', 'footwork_low'],
  },
  {
    id: 'mobility-flow',
    title: 'Hip & Ankle Mobility Flow',
    category: 'athleticism',
    level: 'beginner',
    duration: '5 min',
    summary: 'Loosens the joints that most limit stance depth and footwork range — hips and ankles.',
    steps: [
      'World\'s greatest stretch: 5 reps each side.',
      'Ankle rocks (knee over toe, heel down): 10 reps each side.',
      'Deep squat hold with gentle rocking: 45 seconds.',
    ],
    tags: ['knee_straight', 'stance_narrow'],
  },
]

export function getDrillsForTags(tags: string[]): Drill[] {
  const tagSet = new Set(tags)
  return DRILLS.filter((drill) => drill.tags.some((tag) => tagSet.has(tag)))
}

export function getDrillsByCategory(category: DrillCategory): Drill[] {
  return DRILLS.filter((drill) => drill.category === category)
}
