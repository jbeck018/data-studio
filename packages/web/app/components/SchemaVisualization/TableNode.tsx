import { Handle, Position } from '@xyflow/react';
import { TableNodeData } from '../../types/schema';

interface TableNodeProps {
  data: TableNodeData;
}

export default function TableNode({ data }: TableNodeProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-medium text-gray-900">{data.name}</div>
      <div className="mt-2 space-y-1">
        {data.columns?.map((column, index) => (
          <div key={index} className="text-sm text-gray-500">
            {column.name}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}
