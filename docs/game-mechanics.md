# Game Mechanics

## Core Mechanics

### Monster System

Monsters are the core entities in the game and have the following properties:

- **Element**: Fire, Water, Earth, or Air
- **Tier**: 1-5, representing the monster's power level
- **Stats**: Health, Attack, Defense
- **Level**: Increases with experience, improving stats
- **Experience**: Gained from battles, used for leveling up

### Element System

The game features an elemental rock-paper-scissors system:

- **Fire** is strong against Air, weak against Water
- **Water** is strong against Fire, weak against Earth
- **Earth** is strong against Water, weak against Air
- **Air** is strong against Earth, weak against Fire

When a monster attacks an element it's strong against, it deals 50% more damage. When attacking an element it's weak against, it deals 50% less damage.

### Merging System

Players can merge two monsters to create a more powerful one if:
- They are the same element
- They are the same tier

The resulting monster will be:
- The same element as the original monsters
- One tier higher
- Have significantly improved stats
- Inherit some experience from the merged monsters

### Battle System

Battles are turn-based with the following flow:

1. Player monsters and enemy monsters take turns attacking
2. Damage is calculated based on attacker's attack stat, defender's defense stat, and elemental relationships
3. Monsters are defeated when their health reaches zero
4. Battle ends when all monsters on one side are defeated
5. Surviving player monsters gain experience
6. Player earns coins based on the battle outcome

### Wave Progression

The game features a wave-based progression system:
- Each wave has increasingly difficult enemies
- Enemy stats scale with wave number
- Higher waves yield more rewards
- The game has a maximum number of waves (configurable)

## Economy

- **Coins**: Used to purchase new monsters
- **Monster Cost**: Fixed amount (configurable)
- **Battle Rewards**: Coins and experience based on wave number and outcome

## Leveling System

Monsters gain experience from battles:
- Experience required for level up increases with each level
- Leveling up improves monster stats
- Higher-level monsters are more effective in battle
