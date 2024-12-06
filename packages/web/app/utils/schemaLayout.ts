import { Node, Edge } from '@xyflow/react';
import { TableNodeData, RelationshipEdgeData } from '../types/schema';

const PADDING = 50;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

export function getAutoLayout(nodes: Node<TableNodeData>[]): Node<TableNodeData>[] {
  const GRID_SIZE = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % GRID_SIZE) * (NODE_WIDTH + PADDING),
      y: Math.floor(index / GRID_SIZE) * (NODE_HEIGHT + PADDING),
    },
  }));
}

export function getForceLayout(
  nodes: Node<TableNodeData>[],
  edges: Edge<RelationshipEdgeData>[]
): Node<TableNodeData>[] {
  // Simple force-directed layout
  const iterations = 100;
  const k = 100; // Spring constant
  const positions = nodes.map((node) => ({ ...node.position }));

  for (let i = 0; i < iterations; i++) {
    // Calculate repulsive forces
    for (let j = 0; j < nodes.length; j++) {
      for (let l = 0; l < nodes.length; l++) {
        if (j === l) continue;

        const dx = positions[l].x - positions[j].x;
        const dy = positions[l].y - positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) continue;

        const force = k / (distance * distance);
        positions[j].x -= (dx / distance) * force;
        positions[j].y -= (dy / distance) * force;
        positions[l].x += (dx / distance) * force;
        positions[l].y += (dy / distance) * force;
      }
    }

    // Calculate attractive forces (edges)
    for (const edge of edges) {
      const sourceIndex = nodes.findIndex((n) => n.id === edge.source);
      const targetIndex = nodes.findIndex((n) => n.id === edge.target);

      if (sourceIndex === -1 || targetIndex === -1) continue;

      const dx = positions[targetIndex].x - positions[sourceIndex].x;
      const dy = positions[targetIndex].y - positions[sourceIndex].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const force = (distance * distance) / k;
      positions[sourceIndex].x += (dx / distance) * force;
      positions[sourceIndex].y += (dy / distance) * force;
      positions[targetIndex].x -= (dx / distance) * force;
      positions[targetIndex].y -= (dy / distance) * force;
    }
  }

  return nodes.map((node, index) => ({
    ...node,
    position: positions[index],
  }));
}

export function getCircularLayout(nodes: Node<TableNodeData>[]): Node<TableNodeData>[] {
  const radius = (nodes.length * (NODE_WIDTH + PADDING)) / (2 * Math.PI);
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: radius * Math.cos((2 * Math.PI * index) / nodes.length),
      y: radius * Math.sin((2 * Math.PI * index) / nodes.length),
    },
  }));
}

export function getTreeLayout(
  nodes: Node<TableNodeData>[],
  edges: Edge<RelationshipEdgeData>[],
  direction: 'horizontal' | 'vertical'
): Node<TableNodeData>[] {
  const levels: { [key: string]: number } = {};
  const visited = new Set<string>();

  // Find root nodes (nodes with no incoming edges)
  const hasIncomingEdge = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter((node) => !hasIncomingEdge.has(node.id));

  // Perform BFS to assign levels
  const queue = rootNodes.map((node) => ({ node, level: 0 }));
  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    if (visited.has(node.id)) continue;

    visited.add(node.id);
    levels[node.id] = level;

    const outgoingEdges = edges.filter((e) => e.source === node.id);
    for (const edge of outgoingEdges) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (targetNode && !visited.has(targetNode.id)) {
        queue.push({ node: targetNode, level: level + 1 });
      }
    }
  }

  // Position nodes based on their levels
  const nodesPerLevel: { [key: number]: number[] } = {};
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!nodesPerLevel[level]) nodesPerLevel[level] = [];
    nodesPerLevel[level].push(Number(nodeId));
  });

  return nodes.map((node) => {
    const level = levels[node.id] || 0;
    const nodesAtLevel = nodesPerLevel[level] || [];
    const index = nodesAtLevel.indexOf(Number(node.id));
    const x = direction === 'horizontal' ? level * (NODE_WIDTH + PADDING) : index * (NODE_WIDTH + PADDING);
    const y = direction === 'horizontal' ? index * (NODE_HEIGHT + PADDING) : level * (NODE_HEIGHT + PADDING);

    return {
      ...node,
      position: { x, y },
    };
  });
}
