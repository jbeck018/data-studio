import { memo } from 'react';
import { EdgeProps, getBezierPath, Position } from '@xyflow/react';
import { RelationshipEdgeData } from '../../types/schema';

interface RelationshipEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data: RelationshipEdgeData;
}

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: RelationshipEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#b1b1b7"
        markerEnd="url(#arrow)"
      />
      {data.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px' }}
            startOffset="50%"
            textAnchor="middle"
            className="text-gray-500"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
}

export default memo(RelationshipEdge);
