/**
 * Animation service that provides animation variants and utilities
 * for consistent animations throughout the application (View)
 */
export class AnimationService {
  /**
   * Get animation variants for monster attacks
   * @param isPlayer Whether the monster is a player monster
   */
  static getAttackVariants(isPlayer: boolean = true) {
    return {
      idle: { x: 0 },
      attacking: {
        x: isPlayer 
          ? [0, 10, 50, 10, 0]  // Player attack animation
          : [0, -10, -50, -10, 0], // Enemy attack animation
        transition: { 
          duration: 0.5, 
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1]
        }
      }
    };
  }

  /**
   * Get animation variants for monster merging
   */
  static getMergeVariants() {
    return {
      idle: { 
        scale: 1,
        rotate: 0,
        filter: "brightness(1)"
      },
      merging: {
        scale: [1, 1.2, 0.8, 1.3, 1],
        rotate: [0, 10, -10, 5, 0],
        filter: [
          "brightness(1)", 
          "brightness(1.5)", 
          "brightness(2)", 
          "brightness(1.5)", 
          "brightness(1)"
        ],
        transition: { 
          duration: 0.8, 
          times: [0, 0.2, 0.4, 0.6, 1],
          ease: "easeInOut"
        }
      }
    };
  }

  /**
   * Get animation variants for UI elements
   */
  static getUIVariants() {
    return {
      hidden: { 
        opacity: 0, 
        y: 20 
      },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        y: 20,
        transition: {
          duration: 0.2,
          ease: "easeIn"
        }
      }
    };
  }

  /**
   * Get animation variants for damage numbers
   * @param isCritical Whether the damage is critical
   */
  static getDamageVariants(isCritical: boolean = false) {
    return {
      initial: { 
        opacity: 0, 
        y: 0, 
        scale: 0.5 
      },
      animate: { 
        opacity: [0, 1, 1, 0], 
        y: -50, 
        scale: isCritical ? [0.5, 1.5, 1.2, 0.8] : [0.5, 1.2, 1, 0.8],
        transition: { 
          duration: 1, 
          times: [0, 0.2, 0.8, 1],
          ease: "easeOut"
        }
      }
    };
  }

  /**
   * Get idle animation for a monster based on its element
   * @param element The monster's element
   */
  static getIdleAnimation(element: string) {
    switch (element) {
      case 'fire':
        return {
          y: [0, -2, 0, -2, 0],
          rotate: [0, 1, 0, 1, 0],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }
        };
      case 'water':
        return {
          y: [0, -1, 0, -1, 0],
          scale: [1, 1.02, 1, 1.02, 1],
          transition: { 
            repeat: Infinity, 
            duration: 3, 
            ease: "easeInOut" 
          }
        };
      case 'earth':
        return {
          rotate: [0, 0.5, 0, 0.5, 0],
          transition: { 
            repeat: Infinity, 
            duration: 4, 
            ease: "easeInOut" 
          }
        };
      case 'air':
        return {
          y: [0, -2, 0, -2, 0],
          x: [0, 1, 0, -1, 0],
          transition: { 
            repeat: Infinity, 
            duration: 2.5, 
            ease: "easeInOut" 
          }
        };
      default:
        return {
          scale: [1, 1.03, 1],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }
        };
    }
  }

  /**
   * Get hover animation for buttons
   * @param color Optional shadow color for hover effect
   */
  static getButtonHoverAnimation(color?: string) {
    return {
      scale: 1.05,
      boxShadow: color 
        ? `0 0 8px ${color}` 
        : "0 0 8px rgba(79, 70, 229, 0.6)"
    };
  }

  /**
   * Get tap animation for buttons
   */
  static getButtonTapAnimation() {
    return {
      scale: 0.95
    };
  }
}
