import type { Node, Edge } from '@xyflow/react';
import type { TableNode, RelationshipEdge, TableColumn } from '../types/schema';

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  rankdir?: 'TB' | 'LR';
  ranksep?: number;
  nodesep?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

interface TableNodeData {
  label: string;
  columns: TableColumn[];
}

export type LayoutType = 'auto' | 'horizontal' | 'vertical' | 'circular' | 'tree' | 'force' | 'custom';

// Force-directed layout
export function calculateForceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    nodeWidth = 250,
    nodeHeight = 200,
    ranksep = 300,
    nodesep = 150,
  } = options;

  // Simple force-directed layout implementation
  const iterations = 100;
  const k = Math.sqrt((1000 * 1000) / nodes.length);
  const positions = new Map(nodes.map(node => [node.id, { ...node.position }]));
  
  for (let i = 0; i < iterations; i++) {
    // Calculate repulsive forces
    nodes.forEach(v => {
      nodes.forEach(u => {
        if (v.id !== u.id) {
          const dx = positions.get(v.id)!.x - positions.get(u.id)!.x;
          const dy = positions.get(v.id)!.y - positions.get(u.id)!.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const force = k * k / distance;
            positions.get(v.id)!.x += dx / distance * force;
            positions.get(v.id)!.y += dy / distance * force;
          }
        }
      });
    });

    // Calculate attractive forces
    edges.forEach(edge => {
      const source = positions.get(edge.source)!;
      const target = positions.get(edge.target)!;
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const force = distance * distance / k;
        const moveX = dx / distance * force;
        const moveY = dy / distance * force;
        positions.get(edge.source)!.x -= moveX;
        positions.get(edge.source)!.y -= moveY;
        positions.get(edge.target)!.x += moveX;
        positions.get(edge.target)!.y += moveY;
      }
    });
  }

  return nodes.map(node => ({
    ...node,
    position: positions.get(node.id)!,
  }));
}

// Circular layout
export function calculateCircularLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    radius = 500,
    startAngle = 0,
    endAngle = 2 * Math.PI,
  } = options;

  const angleStep = (endAngle - startAngle) / nodes.length;
  
  return nodes.map((node, index) => {
    const angle = startAngle + index * angleStep;
    return {
      ...node,
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      },
    };
  });
}

// Tree layout
export function calculateTreeLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    nodeWidth = 250,
    nodeHeight = 200,
    rankdir = 'TB',
    ranksep = 300,
    nodesep = 150,
  } = options;

  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(n => !hasIncoming.has(n.id));

  // Build adjacency list
  const children = new Map<string, string[]>();
  edges.forEach(edge => {
    if (!children.has(edge.source)) {
      children.set(edge.source, []);
    }
    children.get(edge.source)!.push(edge.target);
  });

  // Assign levels and positions
  const positions = new Map<string, { x: number; y: number }>();
  const assignPositions = (nodeId: string, level: number, order: number) => {
    const x = rankdir === 'TB' ? order * (nodeWidth + nodesep) : level * (nodeWidth + ranksep);
    const y = rankdir === 'TB' ? level * (nodeHeight + ranksep) : order * (nodeHeight + nodesep);
    positions.set(nodeId, { x, y });

    const nodeChildren = children.get(nodeId) || [];
    nodeChildren.forEach((childId, index) => {
      assignPositions(childId, level + 1, order + index);
    });
  };

  rootNodes.forEach((node, index) => {
    assignPositions(node.id, 0, index);
  });

  // Handle nodes not in the tree
  const unpositioned = nodes.filter(n => !positions.has(n.id));
  unpositioned.forEach((node, index) => {
    positions.set(node.id, {
      x: index * (nodeWidth + nodesep),
      y: -1 * (nodeHeight + ranksep),
    });
  });

  return nodes.map(node => ({
    ...node,
    position: positions.get(node.id)!,
  }));
}

// Enhanced node statistics
export interface NodeStatistics {
  basic: {
    totalColumns: number;
    primaryKeyCount: number;
    foreignKeyCount: number;
    nullableColumns: number;
    uniqueConstraints: number;
    indexCount: number;
  };
  relationships: {
    incomingCount: number;
    outgoingCount: number;
    totalRelated: number;
    directlyRelatedTables: string[];
    relationshipTypes: {
      'one-to-one': number;
      'one-to-many': number;
      'many-to-many': number;
    };
  };
  columns: {
    dataTypes: Record<string, number>;
    nullablePercentage: number;
    indexedPercentage: number;
    averageNameLength: number;
  };
  complexity: {
    relationshipComplexity: number; // 0-1 score based on relationship count and types
    schemaComplexity: number; // 0-1 score based on columns, constraints, etc.
    centralityScore: number; // 0-1 score based on how central this table is in the schema
  };
}

export function calculateDetailedNodeStatistics(
  node: TableNode,
  edges: Edge[],
  allNodes: TableNode[]
): NodeStatistics {
  const incomingRelations = edges.filter(edge => edge.target === node.id) as RelationshipEdge[];
  const outgoingRelations = edges.filter(edge => edge.source === node.id) as RelationshipEdge[];
  const allRelations = [...incomingRelations, ...outgoingRelations];
  
  // Calculate data type distribution
  const dataTypes = node.data.columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate relationship types
  const relationshipTypes = allRelations.reduce(
    (acc, rel) => {
      acc[rel.data.relationType]++;
      return acc;
    },
    { 'one-to-one': 0, 'one-to-many': 0, 'many-to-many': 0 } as Record<RelationshipEdge['data']['relationType'], number>
  );

  // Calculate complexity scores
  const relationshipComplexity = Math.min(
    1,
    (allRelations.length / allNodes.length) +
    (relationshipTypes['many-to-many'] * 0.2) +
    (relationshipTypes['one-to-many'] * 0.1)
  );

  const schemaComplexity = Math.min(
    1,
    (node.data.columns.length / 50) + // Normalize by assuming 50 columns is complex
    (node.data.columns.filter(c => c.isPrimaryKey).length * 0.1) +
    (node.data.columns.filter(c => c.isForeignKey).length * 0.05)
  );

  // Calculate centrality score
  const centralityScore = Math.min(
    1,
    allRelations.length / (2 * allNodes.length) // Normalize by maximum possible relations
  );

  return {
    basic: {
      totalColumns: node.data.columns.length,
      primaryKeyCount: node.data.columns.filter(c => c.isPrimaryKey).length,
      foreignKeyCount: node.data.columns.filter(c => c.isForeignKey).length,
      nullableColumns: node.data.columns.filter(c => c.nullable).length,
      uniqueConstraints: node.data.columns.filter(c => c.isPrimaryKey || c.isUnique).length,
      indexCount: node.data.columns.filter(c => c.isIndexed).length,
    },
    relationships: {
      incomingCount: incomingRelations.length,
      outgoingCount: outgoingRelations.length,
      totalRelated: new Set([
        ...incomingRelations.map(r => r.source),
        ...outgoingRelations.map(r => r.target),
      ]).size,
      directlyRelatedTables: [
        ...new Set([
          ...incomingRelations.map(r => r.source),
          ...outgoingRelations.map(r => r.target),
        ]),
      ],
      relationshipTypes,
    },
    columns: {
      dataTypes,
      nullablePercentage: (node.data.columns.filter(c => c.nullable).length / node.data.columns.length) * 100,
      indexedPercentage: (node.data.columns.filter(c => c.isIndexed).length / node.data.columns.length) * 100,
      averageNameLength: node.data.columns.reduce((sum, col) => sum + col.name.length, 0) / node.data.columns.length,
    },
    complexity: {
      relationshipComplexity,
      schemaComplexity,
      centralityScore,
    },
  };
}

// Find all related nodes for highlighting
export function findRelatedNodes(
  nodeId: string,
  edges: Edge[]
): Set<string> {
  const related = new Set<string>([nodeId]);
  let changed = true;

  while (changed) {
    changed = false;
    edges.forEach((edge) => {
      if (related.has(edge.source) && !related.has(edge.target)) {
        related.add(edge.target);
        changed = true;
      }
      if (related.has(edge.target) && !related.has(edge.source)) {
        related.add(edge.source);
        changed = true;
      }
    });
  }

  return related;
}

// Find direct relationships for a node
export function findDirectRelationships(
  nodeId: string,
  edges: Edge[]
): Edge[] {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}
