import { Monster } from '../models/Monster';
import { ElementType, MonsterTier } from '../types';

/**
 * Service responsible for monster merging operations
 */
export class MergeService {
  /**
   * Checks if two monsters can be merged
   * @param monster1 First monster
   * @param monster2 Second monster
   * @returns True if monsters can be merged, false otherwise
   */
  static canMerge(monster1: Monster, monster2: Monster): boolean {
    // Validate both monsters exist
    if (!monster1 || !monster2) {
      console.error("Cannot merge: One or both monsters are null", { 
        monster1: monster1 ? { id: monster1.id } : null, 
        monster2: monster2 ? { id: monster2.id } : null 
      });
      return false;
    }
    
    // Can only merge same element and tier
    if (monster1.element !== monster2.element || monster1.tier !== monster2.tier) {
      console.log(`Cannot merge: Different element or tier. Monster1: ${monster1.element}/${monster1.tier}, Monster2: ${monster2.element}/${monster2.tier}`);
      return false;
    }
    
    // Can't merge max tier monsters
    if (monster1.tier === MonsterTier.TIER_5) {
      console.log("Cannot merge: Already at max tier");
      return false;
    }
    
    // Can't merge the same monster with itself
    if (monster1.id === monster2.id) {
      console.log("Cannot merge: Same monster");
      return false;
    }
    
    console.log(`Monsters can be merged: ${monster1.name} and ${monster2.name}`);
    return true;
  }
  
  /**
   * Merges two monsters to create a higher tier monster
   * @param monster1 First monster
   * @param monster2 Second monster
   * @returns The merged monster or null if merge is not possible
   */
  static merge(monster1: Monster, monster2: Monster): Monster | null {
    // Validate both monsters exist
    if (!monster1 || !monster2) {
      console.error("Cannot merge: One or both monsters are null", { 
        monster1: monster1 ? { id: monster1.id } : null, 
        monster2: monster2 ? { id: monster2.id } : null 
      });
      return null;
    }
    
    console.log("Attempting to merge monsters:", { 
      monster1: { 
        id: monster1.id, 
        name: monster1.name, 
        element: monster1.element, 
        tier: monster1.tier 
      }, 
      monster2: { 
        id: monster2.id, 
        name: monster2.name, 
        element: monster2.element, 
        tier: monster2.tier 
      } 
    });
    
    if (!this.canMerge(monster1, monster2)) {
      console.error("Merge failed: monsters cannot be merged");
      return null;
    }

    const newTier = (monster1.tier + 1) as MonsterTier;
    const mergedMonster = Monster.create(monster1.element, newTier);

    // Transfer some experience from the merged monsters
    const experienceBonus = Math.floor((monster1.experience + monster2.experience) / 2);
    
    console.log(`Created merged monster: ${mergedMonster.name} (Tier ${mergedMonster.tier}) with ${experienceBonus} experience bonus`);
    
    // Apply experience to the new monster
    const finalMonster = mergedMonster.addExperience(experienceBonus);
    console.log("Final merged monster:", {
      id: finalMonster.id,
      name: finalMonster.name,
      element: finalMonster.element,
      tier: finalMonster.tier,
      level: finalMonster.level,
      health: finalMonster.health,
      attack: finalMonster.attack,
      defense: finalMonster.defense
    });
    
    return finalMonster;
  }
  
  /**
   * Gets the color for a monster's element
   * @param element Monster element
   * @returns Color hex code
   */
  static getElementColor(element: ElementType): string {
    switch (element) {
      case ElementType.FIRE: return '#f97316';
      case ElementType.WATER: return '#0ea5e9';
      case ElementType.EARTH: return '#65a30d';
      case ElementType.AIR: return '#a3a3a3';
      default: return '#ffffff';
    }
  }
}
