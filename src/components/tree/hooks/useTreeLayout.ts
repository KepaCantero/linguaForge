import { useMemo } from 'react';

export interface LayoutConfig {
  width: number;
  height: number;
  trunkX: number;
  trunkY: number;
  trunkRadius: number;
}

export interface BranchPosition {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  level: number; // 0 = bottom, 1 = middle, 2 = top
  side: 'left' | 'center' | 'right';
}

/**
 * Organic Tree Layout
 * Creates a tree that grows upward with natural branch positions
 *
 * Structure (11 branches):
 * - Level 0 (bottom): 2 branches (left, right) - foundational topics
 * - Level 1 (lower-mid): 3 branches - building topics
 * - Level 2 (upper-mid): 3 branches - intermediate topics
 * - Level 3 (top): 3 branches - advanced topics
 */

const MOBILE_CONFIG: LayoutConfig = {
  width: 360,
  height: 650,
  trunkX: 180,
  trunkY: 580,
  trunkRadius: 30,
};

const DESKTOP_CONFIG: LayoutConfig = {
  width: 500,
  height: 750,
  trunkX: 250,
  trunkY: 680,
  trunkRadius: 40,
};

// Branch distribution pattern for organic look - spread across full height
const BRANCH_LAYOUT = [
  // Level 0 - Base (2 branches) - near the trunk
  { level: 0, offsetX: -0.32, offsetY: 0.18, side: 'left' as const },
  { level: 0, offsetX: 0.32, offsetY: 0.20, side: 'right' as const },
  // Level 1 - Lower (3 branches)
  { level: 1, offsetX: -0.42, offsetY: 0.32, side: 'left' as const },
  { level: 1, offsetX: 0.05, offsetY: 0.38, side: 'center' as const },
  { level: 1, offsetX: 0.40, offsetY: 0.35, side: 'right' as const },
  // Level 2 - Middle (3 branches)
  { level: 2, offsetX: -0.38, offsetY: 0.52, side: 'left' as const },
  { level: 2, offsetX: 0.12, offsetY: 0.58, side: 'center' as const },
  { level: 2, offsetX: 0.42, offsetY: 0.55, side: 'right' as const },
  // Level 3 - Top (3 branches)
  { level: 3, offsetX: -0.28, offsetY: 0.72, side: 'left' as const },
  { level: 3, offsetX: 0.08, offsetY: 0.82, side: 'center' as const },
  { level: 3, offsetX: 0.32, offsetY: 0.75, side: 'right' as const },
];

export function useTreeLayout(isMobile: boolean = true) {
  const config = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
  const viewBox = `0 0 ${config.width} ${config.height}`;

  const branchPositions = useMemo(() => {
    const positions: BranchPosition[] = [];
    // Tree grows from trunk (bottom) up to top with padding
    const treeHeight = config.trunkY - 80; // Space from top to trunk
    const treeWidth = config.width * 0.85; // Use 85% of width

    BRANCH_LAYOUT.forEach((layout) => {
      // Calculate end position (where the node sits)
      // offsetY goes from 0 (near trunk) to 1 (at top)
      const endX = config.trunkX + layout.offsetX * treeWidth;
      const endY = config.trunkY - (treeHeight * layout.offsetY);

      // Calculate start position (on the trunk line)
      // Trunk extends about 40% of tree height
      const trunkTopY = config.trunkY - treeHeight * 0.4;
      const trunkProgress = Math.min(layout.offsetY / 0.4, 1);
      const startY = config.trunkY - (config.trunkY - trunkTopY) * trunkProgress;
      const startX = config.trunkX + (layout.side === 'left' ? -6 : layout.side === 'right' ? 6 : 0);

      // Calculate control point for curved branch (bezier)
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Add curve based on side for organic look
      const curveOffset = layout.side === 'left' ? -25 : layout.side === 'right' ? 25 : 0;
      const controlX = midX + curveOffset * (0.8 + layout.level * 0.15);
      const controlY = midY - 20;

      positions.push({
        startX,
        startY,
        endX,
        endY,
        controlX,
        controlY,
        level: layout.level,
        side: layout.side,
      });
    });

    return positions;
  }, [config]);

  // Get trunk path (the main vertical line with slight curve)
  const trunkPath = useMemo(() => {
    const topY = config.trunkY - (config.height - config.trunkY - 40) * 0.35;
    return `M ${config.trunkX} ${config.trunkY}
            Q ${config.trunkX - 5} ${(config.trunkY + topY) / 2}
              ${config.trunkX} ${topY}`;
  }, [config]);

  // Get crown path (decorative top of tree)
  const crownPath = useMemo(() => {
    const topY = 30;
    const crownWidth = config.width * 0.7;
    const cx = config.trunkX;

    // Create an organic crown shape
    return `
      M ${cx - crownWidth/2} ${topY + 80}
      Q ${cx - crownWidth/2 - 20} ${topY + 40} ${cx - crownWidth/3} ${topY + 20}
      Q ${cx - crownWidth/6} ${topY - 10} ${cx} ${topY}
      Q ${cx + crownWidth/6} ${topY - 10} ${cx + crownWidth/3} ${topY + 20}
      Q ${cx + crownWidth/2 + 20} ${topY + 40} ${cx + crownWidth/2} ${topY + 80}
    `;
  }, [config]);

  return {
    config,
    viewBox,
    branchPositions,
    trunkPath,
    crownPath,
  };
}
