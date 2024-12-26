import { Edge } from '@xyflow/react';
import { TableNodeDataFields, RelationshipEdgeDataFields } from '../types/schema';
import dagre from 'dagre';
import * as d3 from "d3";
import { SimulationNodeDatum } from "d3-force";

interface TableNodeData extends SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Node<T = any> extends SimulationNodeDatum {
  id: string;
  name: string;
  data: T;
  position?: {
    x: number;
    y: number;
  };
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
}

const NODE_WIDTH = 172;
const NODE_HEIGHT = 36;

export function getAutoLayout(nodes: Node<TableNodeDataFields>[]): Node<TableNodeDataFields>[] {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  return nodes.map((node, index) => {
    const angle = (index * 2 * Math.PI) / nodes.length;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
}

export function getForceLayout(
  nodes: Node<TableNodeDataFields>[],
  edges: Edge<RelationshipEdgeDataFields>[]
): Node<TableNodeDataFields>[] {
  const simulation = d3
    .forceSimulation<Node<TableNodeDataFields>>(nodes)
    .force('charge', d3.forceManyBody<Node<TableNodeDataFields>>().strength(-1000))
    .force('center', d3.forceCenter<Node<TableNodeDataFields>>(window.innerWidth / 2, window.innerHeight / 2))
    .force(
      'link',
      d3
        .forceLink<Node<TableNodeDataFields>, d3.SimulationLinkDatum<Node<TableNodeDataFields>>>(edges)
        .id(d => d.id)
        .distance(200)
    )
    .stop();

  // Run the simulation synchronously
  simulation.tick(300);

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.x ?? 0,
      y: node.y ?? 0,
    },
  }));
}

export function getCircularLayout(nodes: Node<TableNodeDataFields>[]): Node<TableNodeDataFields>[] {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;

  return nodes.map((node, index) => {
    const angle = (index * 2 * Math.PI) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
}

export function getTreeLayout(
  nodes: Node<TableNodeDataFields>[],
  edges: Edge<RelationshipEdgeDataFields>[]
): Node<TableNodeDataFields>[] {
  const g = new dagre.graphlib.Graph();

  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 50 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  // Get the positioned nodes from the graph
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
}
