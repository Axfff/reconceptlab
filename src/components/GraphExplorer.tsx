import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "../data/graph";
import type { Locale } from "../i18n/locales";
import { ui } from "../i18n/ui";
import { nodePath } from "../lib/routes";

type Props = {
  lang: Locale;
  nodes: GraphNode[];
  edges: GraphEdge[];
  availableNodeIds: string[];
};

type LayoutNode = GraphNode & {
  height: number;
  labelLines: string[];
  width: number;
  x: number;
  y: number;
};

type LayoutEdge = GraphEdge & {
  curveOffset: number;
  fromNode: LayoutNode;
  labelWidth: number;
  toNode: LayoutNode;
};

type GraphLayout = {
  edges: LayoutEdge[];
  height: number;
  nodes: LayoutNode[];
  signature: string;
  width: number;
};

type Viewport = {
  scale: number;
  x: number;
  y: number;
};

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 480;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 2.8;
const LAYOUT_PADDING = 80;
const NODE_GAP_X = 280;
const NODE_GAP_Y = 132;
const COLUMN_X_DRIFT = 14;
const ORDERING_SWEEPS = 8;
const FORCE_ITERATIONS = 220;
const EDGE_NODE_CLEARANCE = 34;
const EDGE_EDGE_CLEARANCE = 26;
const conceptTypeRank: Record<GraphNode["conceptType"], number> = {
  concept: 0,
  math: 1,
  "data-structure": 2,
  algorithm: 3,
  system: 4,
  tool: 5
};

const interactionCopy = {
  en: {
    controls: "Graph view controls",
    panHint: "Drag the map to pan. Use the mouse wheel or controls to zoom.",
    search: "Search graph",
    searchPlaceholder: "Search concepts",
    searchResults: "Search results",
    noSearchResults: "No matching concepts",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset view",
    zoom: "Zoom"
  },
  zh: {
    controls: "图谱视图控制",
    panHint: "拖动画布可平移。使用鼠标滚轮或按钮缩放。",
    search: "搜索图谱",
    searchPlaceholder: "搜索概念",
    searchResults: "搜索结果",
    noSearchResults: "没有匹配概念",
    zoomIn: "放大",
    zoomOut: "缩小",
    resetView: "重置视图",
    zoom: "缩放"
  }
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function labelLines(label: string, lang: Locale): string[] {
  if (lang === "zh") {
    if (label.length <= 8) return [label];
    const midpoint = Math.ceil(label.length / 2);
    return [label.slice(0, midpoint), label.slice(midpoint)];
  }

  if (label.length <= 18 || !label.includes(" ")) return [label];

  const parts = label.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const part of parts) {
    const next = current ? `${current} ${part}` : part;
    if (next.length > 18 && current) {
      lines.push(current);
      current = part;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function nodeSize(node: GraphNode, lang: Locale): Pick<LayoutNode, "height" | "labelLines" | "width"> {
  const lines = labelLines(node.label[lang], lang);
  const longestLine = Math.max(...lines.map((line) => line.length), node.conceptType.length);
  const width = clamp(longestLine * (lang === "zh" ? 15 : 8.2) + 48, 132, 220);
  const height = 58 + lines.length * 17;

  return {
    height,
    labelLines: lines,
    width
  };
}

function nodeDepths(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const orderedIds = nodes.map((node) => node.id).sort();
  const depths = new Map(orderedIds.map((id) => [id, 0]));

  for (let pass = 0; pass < orderedIds.length; pass += 1) {
    let changed = false;
    for (const edge of [...edges].sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`))) {
      const fromDepth = depths.get(edge.from);
      const toDepth = depths.get(edge.to);
      if (fromDepth === undefined || toDepth === undefined) continue;

      const nextDepth = Math.min(fromDepth + 1, orderedIds.length - 1);
      if (nextDepth > toDepth) {
        depths.set(edge.to, nextDepth);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return depths;
}

function edgeKey(edge: GraphEdge): string {
  return `${edge.from}:${edge.to}:${edge.type}`;
}

function median(values: number[]): number {
  const ordered = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[midpoint - 1] + ordered[midpoint]) / 2 : ordered[midpoint];
}

function neighborOrder(
  node: GraphNode,
  depth: number,
  depths: Map<string, number>,
  edges: GraphEdge[],
  columnOrder: Map<string, number>,
  direction: "forward" | "backward"
): number {
  const neighbors = edges
    .filter((edge) => {
      if (direction === "forward") return edge.to === node.id && (depths.get(edge.from) ?? 0) < depth;
      return edge.from === node.id && (depths.get(edge.to) ?? 0) > depth;
    })
    .map((edge) => columnOrder.get(direction === "forward" ? edge.from : edge.to))
    .filter((order): order is number => order !== undefined);

  return neighbors.length ? median(neighbors) : Number.POSITIVE_INFINITY;
}

function sortColumnByNeighbors(
  column: GraphNode[],
  depth: number,
  depths: Map<string, number>,
  edges: GraphEdge[],
  columnOrder: Map<string, number>,
  direction: "forward" | "backward"
): GraphNode[] {
  return [...column].sort((a, b) => {
    const neighborOrderDelta =
      neighborOrder(a, depth, depths, edges, columnOrder, direction) -
      neighborOrder(b, depth, depths, edges, columnOrder, direction);
    const rankOrder = conceptTypeRank[a.conceptType] - conceptTypeRank[b.conceptType];
    return neighborOrderDelta || rankOrder || a.id.localeCompare(b.id);
  });
}

function updateColumnOrder(orderedColumns: Map<number, GraphNode[]>): Map<string, number> {
  const order = new Map<string, number>();

  for (const column of orderedColumns.values()) {
    column.forEach((node, index) => order.set(node.id, index));
  }

  return order;
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  return length > 0.001 ? { x: x / length, y: y / length } : { x: 0, y: 1 };
}

function closestPointOnSegment(
  point: Pick<LayoutNode, "x" | "y">,
  start: Pick<LayoutNode, "x" | "y">,
  end: Pick<LayoutNode, "x" | "y">
): { distance: number; t: number; x: number; y: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared > 0 ? clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1) : 0;
  const x = start.x + dx * t;
  const y = start.y + dy * t;

  return {
    distance: Math.hypot(point.x - x, point.y - y),
    t,
    x,
    y
  };
}

function segmentsIntersect(
  aStart: Pick<LayoutNode, "x" | "y">,
  aEnd: Pick<LayoutNode, "x" | "y">,
  bStart: Pick<LayoutNode, "x" | "y">,
  bEnd: Pick<LayoutNode, "x" | "y">
): boolean {
  const denominator = (aEnd.x - aStart.x) * (bEnd.y - bStart.y) - (aEnd.y - aStart.y) * (bEnd.x - bStart.x);
  if (Math.abs(denominator) < 0.001) return false;

  const ua = ((bStart.x - aStart.x) * (bEnd.y - bStart.y) - (bStart.y - aStart.y) * (bEnd.x - bStart.x)) / denominator;
  const ub = ((bStart.x - aStart.x) * (aEnd.y - aStart.y) - (bStart.y - aStart.y) * (aEnd.x - aStart.x)) / denominator;

  return ua > 0.04 && ua < 0.96 && ub > 0.04 && ub < 0.96;
}

function segmentDistance(a: LayoutEdge, b: LayoutEdge): number {
  return Math.min(
    closestPointOnSegment(a.fromNode, b.fromNode, b.toNode).distance,
    closestPointOnSegment(a.toNode, b.fromNode, b.toNode).distance,
    closestPointOnSegment(b.fromNode, a.fromNode, a.toNode).distance,
    closestPointOnSegment(b.toNode, a.fromNode, a.toNode).distance
  );
}

function segmentIntersectsNode(
  start: Pick<LayoutNode, "x" | "y">,
  end: Pick<LayoutNode, "x" | "y">,
  node: Pick<LayoutNode, "height" | "width" | "x" | "y">,
  padding = 0
): boolean {
  const left = node.x - node.width / 2 - padding;
  const right = node.x + node.width / 2 + padding;
  const top = node.y - node.height / 2 - padding;
  const bottom = node.y + node.height / 2 + padding;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let minT = 0;
  let maxT = 1;

  for (const [axisDelta, axisDistance] of [
    [-dx, start.x - left],
    [dx, right - start.x],
    [-dy, start.y - top],
    [dy, bottom - start.y]
  ]) {
    if (Math.abs(axisDelta) < 0.001) {
      if (axisDistance < 0) return false;
      continue;
    }

    const nextT = axisDistance / axisDelta;
    if (axisDelta < 0) {
      if (nextT > maxT) return false;
      minT = Math.max(minT, nextT);
    } else {
      if (nextT < minT) return false;
      maxT = Math.min(maxT, nextT);
    }
  }

  return maxT > 0.08 && minT < 0.92;
}

function sharedEndpoint(a: LayoutEdge, b: LayoutEdge): string | null {
  const aIds = [a.from, a.to];
  const bIds = new Set([b.from, b.to]);
  return aIds.find((id) => bIds.has(id)) ?? null;
}

function separateColumnNodes(nodes: LayoutNode[], minY: number, maxY: number): void {
  const ordered = [...nodes].sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
  if (ordered.length < 2) return;

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    const minimumGap = (previous.height + current.height) / 2 + 32;
    if (current.y - previous.y < minimumGap) {
      current.y = previous.y + minimumGap;
    }
  }

  const last = ordered[ordered.length - 1];
  const overflowBottom = last.y + last.height / 2 - maxY;
  if (overflowBottom > 0) {
    for (const node of ordered) node.y -= overflowBottom;
  }

  const overflowTop = minY - (ordered[0].y - ordered[0].height / 2);
  if (overflowTop > 0) {
    for (const node of ordered) node.y += overflowTop;
  }
}

function routeEdgeCurves(edges: LayoutEdge[], nodes: LayoutNode[]): void {
  for (const edge of edges) {
    const sign = stableHash(edgeKey(edge)) % 2 === 0 ? 1 : -1;
    const obstacleCount = nodes.filter(
      (node) =>
        node.id !== edge.from &&
        node.id !== edge.to &&
        segmentIntersectsNode(edge.fromNode, edge.toNode, node, 12)
    ).length;

    edge.curveOffset = obstacleCount > 0 ? sign * Math.min(172, 72 + obstacleCount * 18) : 0;
  }

  for (let aIndex = 0; aIndex < edges.length; aIndex += 1) {
    for (let bIndex = aIndex + 1; bIndex < edges.length; bIndex += 1) {
      const a = edges[aIndex];
      const b = edges[bIndex];
      const shared = sharedEndpoint(a, b);
      const aDx = a.toNode.x - a.fromNode.x;
      const aDy = a.toNode.y - a.fromNode.y;
      const bDx = b.toNode.x - b.fromNode.x;
      const bDy = b.toNode.y - b.fromNode.y;
      const aLength = Math.hypot(aDx, aDy) || 1;
      const bLength = Math.hypot(bDx, bDy) || 1;
      const cross = (aDx / aLength) * (bDy / bLength) - (aDy / aLength) * (bDx / bLength);
      const areCloseParallel = Math.abs(cross) < 0.12 && segmentDistance(a, b) < EDGE_EDGE_CLEARANCE;
      const doCross = !shared && segmentsIntersect(a.fromNode, a.toNode, b.fromNode, b.toNode);

      if (!areCloseParallel && !doCross) continue;

      const sign = edgeKey(a).localeCompare(edgeKey(b)) <= 0 ? -1 : 1;
      const pressure = doCross ? 24 : 16;
      a.curveOffset += sign * pressure;
      b.curveOffset -= sign * pressure;
    }
  }

  for (const edge of edges) {
    edge.curveOffset = clamp(edge.curveOffset, -190, 190);
    if (Math.abs(edge.curveOffset) < 8) edge.curveOffset = 0;
  }
}

export function computeLayout(nodes: GraphNode[], edges: GraphEdge[], lang: Locale): GraphLayout {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...edges].sort((a, b) => edgeKey(a).localeCompare(edgeKey(b)));
  const depths = nodeDepths(sortedNodes, sortedEdges);
  const columns = new Map<number, GraphNode[]>();

  for (const node of sortedNodes) {
    const depth = depths.get(node.id) ?? 0;
    const column = columns.get(depth) ?? [];
    column.push(node);
    columns.set(depth, column);
  }

  const maxDepth = Math.max(0, ...Array.from(columns.keys()));
  const orderedColumns = new Map<number, GraphNode[]>();

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const orderedColumn = [...(columns.get(depth) ?? [])].sort((a, b) => {
      const rankOrder = conceptTypeRank[a.conceptType] - conceptTypeRank[b.conceptType];
      return rankOrder || a.id.localeCompare(b.id);
    });
    orderedColumns.set(depth, orderedColumn);
  }

  let columnOrder = updateColumnOrder(orderedColumns);
  for (let sweep = 0; sweep < ORDERING_SWEEPS; sweep += 1) {
    for (let depth = 1; depth <= maxDepth; depth += 1) {
      orderedColumns.set(
        depth,
        sortColumnByNeighbors(orderedColumns.get(depth) ?? [], depth, depths, sortedEdges, columnOrder, "forward")
      );
      columnOrder = updateColumnOrder(orderedColumns);
    }

    for (let depth = maxDepth - 1; depth >= 0; depth -= 1) {
      orderedColumns.set(
        depth,
        sortColumnByNeighbors(orderedColumns.get(depth) ?? [], depth, depths, sortedEdges, columnOrder, "backward")
      );
      columnOrder = updateColumnOrder(orderedColumns);
    }
  }

  const maxColumnSize = Math.max(1, ...Array.from(orderedColumns.values()).map((column) => column.length));
  const width = Math.max(VIEWBOX_WIDTH, LAYOUT_PADDING * 2 + (maxDepth + 1) * NODE_GAP_X);
  const height = Math.max(VIEWBOX_HEIGHT, LAYOUT_PADDING * 2 + maxColumnSize * NODE_GAP_Y);
  const sizedNodes = new Map<string, LayoutNode>();

  for (const [depth, orderedColumn] of orderedColumns) {
    const totalHeight = (orderedColumn.length - 1) * NODE_GAP_Y;
    const startY = height / 2 - totalHeight / 2;

    orderedColumn.forEach((node, index) => {
      const size = nodeSize(node, lang);
      const hashAngle = (stableHash(node.id) % 360) * (Math.PI / 180);
      sizedNodes.set(node.id, {
        ...node,
        ...size,
        x: LAYOUT_PADDING + depth * NODE_GAP_X,
        y: startY + index * NODE_GAP_Y + Math.sin(hashAngle) * 8
      });
    });
  }

  const layoutNodes = Array.from(sizedNodes.values());
  const edgePairs = sortedEdges
    .map((edge) => {
      const fromNode = sizedNodes.get(edge.from);
      const toNode = sizedNodes.get(edge.to);
      return fromNode && toNode ? { ...edge, curveOffset: 0, fromNode, labelWidth: edge.type.length * 7 + 18, toNode } : null;
    })
    .filter((edge): edge is LayoutEdge => edge !== null);

  for (let iteration = 0; iteration < FORCE_ITERATIONS; iteration += 1) {
    const forces = new Map(layoutNodes.map((node) => [node.id, { x: 0, y: 0 }]));
    const temperature = 1 - iteration / FORCE_ITERATIONS;

    for (let aIndex = 0; aIndex < layoutNodes.length; aIndex += 1) {
      for (let bIndex = aIndex + 1; bIndex < layoutNodes.length; bIndex += 1) {
        const a = layoutNodes[aIndex];
        const b = layoutNodes[bIndex];
        const minX = (a.width + b.width) / 2 + 54;
        const minY = (a.height + b.height) / 2 + 44;
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
          const angle = (stableHash(`${a.id}:${b.id}`) % 360) * (Math.PI / 180);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
        }

        const overlapX = minX - Math.abs(dx);
        const overlapY = minY - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          const pushX = Math.sign(dx) * overlapX * 0.025;
          const pushY = Math.sign(dy) * overlapY * 0.035;
          const aForce = forces.get(a.id);
          const bForce = forces.get(b.id);
          if (aForce && bForce) {
            aForce.x -= pushX;
            aForce.y -= pushY;
            bForce.x += pushX;
            bForce.y += pushY;
          }
        }
      }
    }

    for (const edge of edgePairs) {
      for (const node of layoutNodes) {
        if (node.id === edge.from || node.id === edge.to) continue;

        const closest = closestPointOnSegment(node, edge.fromNode, edge.toNode);
        const clearance = node.height / 2 + EDGE_NODE_CLEARANCE;
        if (closest.t <= 0.08 || closest.t >= 0.92 || closest.distance >= clearance) continue;

        const fallbackSign = stableHash(`${edgeKey(edge)}:${node.id}`) % 2 === 0 ? 1 : -1;
        const fallback = normalizeVector(
          -(edge.toNode.y - edge.fromNode.y) * fallbackSign,
          (edge.toNode.x - edge.fromNode.x) * fallbackSign
        );
        const direction =
          closest.distance > 0.001 ? normalizeVector(node.x - closest.x, node.y - closest.y) : fallback;
        const pressure = (clearance - closest.distance) * 0.024;
        const force = forces.get(node.id);
        const fromForce = forces.get(edge.from);
        const toForce = forces.get(edge.to);

        if (force) {
          force.x += direction.x * pressure;
          force.y += direction.y * pressure;
        }
        if (fromForce && toForce) {
          fromForce.y -= direction.y * pressure * 0.16;
          toForce.y -= direction.y * pressure * 0.16;
        }
      }
    }

    for (let aIndex = 0; aIndex < edgePairs.length; aIndex += 1) {
      for (let bIndex = aIndex + 1; bIndex < edgePairs.length; bIndex += 1) {
        const a = edgePairs[aIndex];
        const b = edgePairs[bIndex];
        const shared = sharedEndpoint(a, b);
        const aDx = a.toNode.x - a.fromNode.x;
        const aDy = a.toNode.y - a.fromNode.y;
        const bDx = b.toNode.x - b.fromNode.x;
        const bDy = b.toNode.y - b.fromNode.y;
        const aLength = Math.hypot(aDx, aDy) || 1;
        const bLength = Math.hypot(bDx, bDy) || 1;
        const cross = (aDx / aLength) * (bDy / bLength) - (aDy / aLength) * (bDx / bLength);

        if (!shared && segmentsIntersect(a.fromNode, a.toNode, b.fromNode, b.toNode)) {
          const sourceDelta = a.fromNode.y - b.fromNode.y;
          const targetDelta = a.toNode.y - b.toNode.y;
          const sourceSign = sourceDelta === 0 ? (edgeKey(a).localeCompare(edgeKey(b)) <= 0 ? -1 : 1) : Math.sign(sourceDelta);
          const targetSign = targetDelta === 0 ? sourceSign : Math.sign(targetDelta);
          const crossingPressure = 1.8;
          const aFromForce = forces.get(a.from);
          const aToForce = forces.get(a.to);
          const bFromForce = forces.get(b.from);
          const bToForce = forces.get(b.to);

          if (aToForce && bToForce) {
            aToForce.y += sourceSign * crossingPressure;
            bToForce.y -= sourceSign * crossingPressure;
          }
          if (aFromForce && bFromForce) {
            aFromForce.y += targetSign * crossingPressure;
            bFromForce.y -= targetSign * crossingPressure;
          }
        }

        if (Math.abs(cross) < 0.12 && segmentDistance(a, b) < EDGE_EDGE_CLEARANCE) {
          const orderSign = edgeKey(a).localeCompare(edgeKey(b)) <= 0 ? -1 : 1;
          const aNormal = normalizeVector(-aDy * orderSign, aDx * orderSign);
          const bNormal = normalizeVector(bDy * orderSign, -bDx * orderSign);
          const separationPressure = (EDGE_EDGE_CLEARANCE - segmentDistance(a, b)) * 0.018;

          for (const id of [a.from, a.to]) {
            if (id === shared) continue;
            const force = forces.get(id);
            if (force) {
              force.x += aNormal.x * separationPressure;
              force.y += aNormal.y * separationPressure;
            }
          }

          for (const id of [b.from, b.to]) {
            if (id === shared) continue;
            const force = forces.get(id);
            if (force) {
              force.x += bNormal.x * separationPressure;
              force.y += bNormal.y * separationPressure;
            }
          }
        }
      }
    }

    for (const edge of edgePairs) {
      const dx = edge.toNode.x - edge.fromNode.x;
      const dy = edge.toNode.y - edge.fromNode.y;
      const distance = Math.hypot(dx, dy) || 1;
      const target = 235;
      const spring = (distance - target) * 0.006;
      const forceX = (dx / distance) * spring;
      const forceY = (dy / distance) * spring;
      const fromForce = forces.get(edge.from);
      const toForce = forces.get(edge.to);

      if (fromForce && toForce) {
        fromForce.x += forceX;
        fromForce.y += forceY;
        toForce.x -= forceX;
        toForce.y -= forceY;
      }
    }

    for (const node of layoutNodes) {
      const depth = depths.get(node.id) ?? 0;
      const targetX = LAYOUT_PADDING + depth * NODE_GAP_X;
      const force = forces.get(node.id);
      if (!force) continue;

      force.x += (targetX - node.x) * 0.035;
      node.x = clamp(
        node.x + force.x * temperature,
        Math.max(LAYOUT_PADDING, targetX - COLUMN_X_DRIFT),
        Math.min(width - LAYOUT_PADDING, targetX + COLUMN_X_DRIFT)
      );
      node.y = clamp(node.y + force.y * temperature, LAYOUT_PADDING, height - LAYOUT_PADDING);
    }
  }

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    separateColumnNodes(
      layoutNodes.filter((node) => (depths.get(node.id) ?? 0) === depth),
      LAYOUT_PADDING,
      height - LAYOUT_PADDING
    );
  }

  routeEdgeCurves(edgePairs, layoutNodes);

  const minX = Math.min(...layoutNodes.map((node) => node.x - node.width / 2));
  const maxX = Math.max(...layoutNodes.map((node) => node.x + node.width / 2));
  const minY = Math.min(...layoutNodes.map((node) => node.y - node.height / 2));
  const maxY = Math.max(...layoutNodes.map((node) => node.y + node.height / 2));
  const offsetX = LAYOUT_PADDING - minX;
  const offsetY = LAYOUT_PADDING - minY;

  for (const node of layoutNodes) {
    node.x += offsetX;
    node.y += offsetY;
  }

  const finalWidth = Math.max(VIEWBOX_WIDTH, maxX - minX + LAYOUT_PADDING * 2);
  const finalHeight = Math.max(VIEWBOX_HEIGHT, maxY - minY + LAYOUT_PADDING * 2);

  return {
    edges: edgePairs,
    height: finalHeight,
    nodes: layoutNodes.sort((a, b) => a.id.localeCompare(b.id)),
    signature: `${sortedNodes.map((node) => node.id).join("|")}::${sortedEdges.map((edge) => `${edge.from}>${edge.to}:${edge.type}`).join("|")}::${lang}`,
    width: finalWidth
  };
}

function fitViewport(layout: GraphLayout): Viewport {
  const scale = clamp(Math.min(VIEWBOX_WIDTH / layout.width, VIEWBOX_HEIGHT / layout.height), MIN_ZOOM, 1);
  return {
    scale,
    x: (VIEWBOX_WIDTH - layout.width * scale) / 2,
    y: (VIEWBOX_HEIGHT - layout.height * scale) / 2
  };
}

function edgePoint(from: LayoutNode, to: LayoutNode): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const scaleX = Math.abs(dx) > 0.001 ? from.width / 2 / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const scaleY = Math.abs(dy) > 0.001 ? from.height / 2 / Math.abs(dy) : Number.POSITIVE_INFINITY;
  const scale = Math.min(scaleX, scaleY, 1);

  return {
    x: from.x + dx * scale,
    y: from.y + dy * scale
  };
}

function curveControlPoint(
  start: Pick<LayoutNode, "x" | "y">,
  end: Pick<LayoutNode, "x" | "y">,
  offset: number
): { x: number; y: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const normal = normalizeVector(-dy, dx);

  return {
    x: (start.x + end.x) / 2 + normal.x * offset,
    y: (start.y + end.y) / 2 + normal.y * offset
  };
}

function curveMidpoint(
  start: Pick<LayoutNode, "x" | "y">,
  control: Pick<LayoutNode, "x" | "y">,
  end: Pick<LayoutNode, "x" | "y">
): { x: number; y: number } {
  return {
    x: start.x * 0.25 + control.x * 0.5 + end.x * 0.25,
    y: start.y * 0.25 + control.y * 0.5 + end.y * 0.25
  };
}

export default function GraphExplorer({ lang, nodes, edges, availableNodeIds }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? "");
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const selected = nodes.find((node) => node.id === selectedId);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const availableSet = useMemo(() => new Set(availableNodeIds), [availableNodeIds]);
  const layout = useMemo(() => computeLayout(nodes, edges, lang), [edges, lang, nodes]);
  const selectedEdges = edges.filter((edge) => edge.from === selectedId || edge.to === selectedId);
  const copy = interactionCopy[lang];
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const searchMatches = useMemo(() => {
    if (!normalizedSearch) return [];

    return nodes
      .filter((node) => {
        const label = node.label[lang].toLocaleLowerCase();
        return label.includes(normalizedSearch) || node.id.toLocaleLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.label[lang].localeCompare(b.label[lang]) || a.id.localeCompare(b.id));
  }, [lang, nodes, normalizedSearch]);
  const searchMatchIds = useMemo(() => new Set(searchMatches.map((node) => node.id)), [searchMatches]);

  useEffect(() => {
    setViewport(fitViewport(layout));
  }, [layout]);

  function goToNode(id: string) {
    if (availableSet.has(id)) {
      window.location.href = nodePath(lang, id);
    } else {
      setSelectedId(id);
    }
  }

  function zoomAt(nextScale: number, centerX = VIEWBOX_WIDTH / 2, centerY = VIEWBOX_HEIGHT / 2) {
    setViewport((current) => {
      const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
      const ratio = scale / current.scale;
      return {
        scale,
        x: centerX - (centerX - current.x) * ratio,
        y: centerY - (centerY - current.y) * ratio
      };
    });
  }

  function resetView() {
    setViewport(fitViewport(layout));
  }

  function clientPointToViewbox(event: React.PointerEvent<SVGSVGElement> | React.WheelEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT
    };
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    const target = event.target as Element;
    if (!target.classList.contains("graph-pan-surface")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - drag.x) / rect.width) * VIEWBOX_WIDTH;
    const dy = ((event.clientY - drag.y) / rect.height) * VIEWBOX_HEIGHT;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setViewport((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const point = clientPointToViewbox(event);
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(viewport.scale * factor, point.x, point.y);
  }

  return (
    <section className="graph-explorer" aria-labelledby="graph-title">
      <div className="graph-header">
        <div>
          <h2 id="graph-title">{ui[lang].visualGraph}</h2>
          {selected ? (
            <p>
              {ui[lang].selectedNode}: <strong>{selected.label[lang]}</strong>
              {availableSet.has(selected.id) ? "" : ` (${ui[lang].unavailable})`}
            </p>
          ) : null}
        </div>
        {selected && availableSet.has(selected.id) ? (
          <a className="graph-preview-link" href={nodePath(lang, selected.id)}>
            {ui[lang].readMore}
          </a>
        ) : selected ? (
          <span className="graph-preview-link disabled">{ui[lang].unavailable}</span>
        ) : null}
      </div>

      <div className="graph-viewbar">
        <p>{copy.panHint}</p>
        <div className="graph-search">
          <label htmlFor="graph-search-input">{copy.search}</label>
          <input
            id="graph-search-input"
            type="search"
            value={searchQuery}
            placeholder={copy.searchPlaceholder}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
        </div>
        <div className="graph-view-controls" aria-label={copy.controls}>
          <button type="button" onClick={() => zoomAt(viewport.scale * 1.18)} aria-label={copy.zoomIn}>
            +
          </button>
          <output aria-label={copy.zoom}>{Math.round(viewport.scale * 100)}%</output>
          <button type="button" onClick={() => zoomAt(viewport.scale / 1.18)} aria-label={copy.zoomOut}>
            -
          </button>
          <button type="button" onClick={resetView} aria-label={copy.resetView}>
            {ui[lang].reset}
          </button>
        </div>
      </div>

      {normalizedSearch ? (
        <div className="graph-search-results" aria-label={copy.searchResults} aria-live="polite">
          {searchMatches.length ? (
            searchMatches.slice(0, 8).map((node) => (
              <button type="button" key={node.id} onClick={() => setSelectedId(node.id)}>
                <span>{node.label[lang]}</span>
                <small>{node.conceptType}</small>
              </button>
            ))
          ) : (
            <p>{copy.noSearchResults}</p>
          )}
        </div>
      ) : null}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={ui[lang].visualGraph}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerUp}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" />
          </marker>
        </defs>
        <rect className="graph-pan-surface" x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />
        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
          {layout.edges.map((edge) => {
            const start = edgePoint(edge.fromNode, edge.toNode);
            const end = edgePoint(edge.toNode, edge.fromNode);
            const control = curveControlPoint(start, end, edge.curveOffset);
            const label = curveMidpoint(start, control, end);
            const isActive = hoveredId ? edge.from === hoveredId || edge.to === hoveredId : false;
            const isDimmed = Boolean(hoveredId && !isActive);
            return (
              <g key={`${edge.from}-${edge.to}-${edge.type}`}>
                <path
                  className={["edge", `edge-${edge.type}`, isActive ? "active" : "", isDimmed ? "dimmed" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
                  markerEnd="url(#arrow)"
                />
                <g
                  className={["edge-label", isActive ? "active" : "", isDimmed ? "dimmed" : ""].filter(Boolean).join(" ")}
                  transform={`translate(${label.x}, ${label.y})`}
                >
                  <rect x={-edge.labelWidth / 2} y="-12" width={edge.labelWidth} height="20" rx="6" />
                  <text textAnchor="middle" y="3">
                    {edge.type}
                  </text>
                </g>
              </g>
            );
          })}
          {layout.nodes.map((node) => {
            const isSelected = node.id === selectedId;
            const isHovered = node.id === hoveredId;
            const isSearchMatch = searchMatchIds.has(node.id);
            const hasPage = availableSet.has(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="svg-node"
                role="button"
                tabIndex={0}
                aria-label={`${node.label[lang]} ${node.status}`}
                onClick={() => goToNode(node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => {
                  setSelectedId(node.id);
                  setHoveredId(node.id);
                }}
                onBlur={() => setHoveredId(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToNode(node.id);
                  }
                }}
              >
                <rect
                  className={[
                    isSelected ? "selected" : "",
                    isHovered ? "hovered" : "",
                    isSearchMatch ? "search-match" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  x={-node.width / 2}
                  y={-node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx="8"
                />
                {node.labelLines.map((line, index) => (
                  <text key={`${node.id}-${line}`} className="node-title" textAnchor="middle" y={-14 + index * 16}>
                    {line}
                  </text>
                ))}
                <text className="node-meta" textAnchor="middle" y={node.height / 2 - 16}>
                  {hasPage ? node.status : ui[lang].unavailable}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {selected ? (
        <aside className="selected-card" aria-label={ui[lang].selectedNode}>
          <h3>{selected.label[lang]}</h3>
          <p>{selected.status}</p>
          <ul>
            {selectedEdges.map((edge) => {
              const targetId = edge.from === selected.id ? edge.to : edge.from;
              const target = nodeMap.get(targetId);
              return target ? (
                <li key={`${edge.from}-${edge.to}`}>
                  <strong>{edge.type}</strong> {target.label[lang]}: {edge.reason[lang]}
                </li>
              ) : null;
            })}
          </ul>
        </aside>
      ) : null}

      <div className="graph-list">
        <h2>{ui[lang].accessibleGraphList}</h2>
        <ul>
          {nodes.map((node) => (
            <li key={node.id}>
              {availableSet.has(node.id) ? (
                <a href={nodePath(lang, node.id)}>{node.label[lang]}</a>
              ) : (
                <span>{node.label[lang]}</span>
              )}
              <span> - {node.status}</span>
              {edges
                .filter((edge) => edge.from === node.id)
                .map((edge) => {
                  const target = nodeMap.get(edge.to);
                  return target ? (
                    <p key={`${edge.from}-${edge.to}`}>
                      {edge.type}: {target.label[lang]}. {edge.reason[lang]}
                    </p>
                  ) : null;
                })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
