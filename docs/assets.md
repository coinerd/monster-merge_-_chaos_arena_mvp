# Game Assets

## Monster SVG Images

The game uses SVG images for monster representations, located in the `public/monsters/` directory.

### Naming Convention

Monster SVG files follow the naming pattern: `[monster-name]-monster.svg`

For example:
- `ember-monster.svg` - Tier 1 Fire monster
- `tide-monster.svg` - Tier 2 Water monster
- `mountain-monster.svg` - Tier 3 Earth monster

### Available Monsters

#### Fire Element
- `ember-monster.svg` (Tier 1)
- `blaze-monster.svg` (Tier 2)
- `inferno-monster.svg` (Tier 3)

#### Water Element
- `splash-monster.svg` (Tier 1)
- `tide-monster.svg` (Tier 2)
- `tsunami-monster.svg` (Tier 3)

#### Earth Element
- `pebble-monster.svg` (Tier 1)
- `boulder-monster.svg` (Tier 2)
- `mountain-monster.svg` (Tier 3)

#### Air Element
- `breeze-monster.svg` (Tier 1)
- `gust-monster.svg` (Tier 2)
- `cyclone-monster.svg` (Tier 3)

### Fallback System

The game includes a fallback system for missing SVG files. If an SVG file is not found, the `MonsterAvatar` component displays a colored div with the monster's name and tier.

## CSS and Styling

The game uses Tailwind CSS for styling, with custom CSS in `src/index.css` for specific game elements:

- Monster grid and cells
- Battle arena and effects
- Health bars
- Buttons and UI elements
- Animations for attacks, merges, and damage

### Animation Effects

The game includes several CSS animations:
- `player-attack-animation`: Animation for player monster attacks
- `enemy-attack-animation`: Animation for enemy monster attacks
- `merge-animation`: Animation for monster merging
- `damage-text`: Animation for damage numbers
- `battle-particle`: Animation for attack particles
- `merge-particle`: Animation for merge particles
- `merge-flash`: Animation for merge flash effect

### Responsive Design

The game uses responsive design principles to adapt to different screen sizes:
- Flex layouts for component positioning
- Media queries for layout changes on smaller screens
- Relative sizing for UI elements
