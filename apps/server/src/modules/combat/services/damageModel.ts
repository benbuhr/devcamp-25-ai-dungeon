import { Stats } from "../../../shared/index.js";
import { Enemy } from "../data/enemies.js";

const MIN_DAMAGE = 1;

export const playerDamageAgainst = (
  playerStats: Stats,
  enemy: Enemy
): number => {
  const raw = playerStats.power;
  const mitigated = raw - enemy.stats.ward;
  return Math.max(MIN_DAMAGE, mitigated);
};

export const enemyDamageAgainst = (
  enemy: Enemy,
  playerStats: Stats,
  wardAuraActive: boolean
): number => {
  const auraMitigation = wardAuraActive ? 1 : 0;
  const raw = enemy.stats.power;
  const mitigated = raw - playerStats.ward - auraMitigation;
  return Math.max(0, mitigated);
};

