import { EdgeProps, getBezierPath } from '@xyflow/react';
import { RelationshipEdgeData } from '../../types/schema';

export default function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<RelationshipEdgeData>) {
  if (!data) return null;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data.label || `${data.sourceTable}.${data.sourceColumn} → ${data.targetTable}.${data.targetColumn}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path stroke-light-border dark:stroke-dark-border"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
          className="fill-light-text-secondary dark:fill-dark-text-secondary"
        >
          {label}
        </textPath>
      </text>
    </>
  );
}
