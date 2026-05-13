import { useCallback, type RefObject } from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowStore } from '../../../core/store/workflow.store';

export const useWorkflowDragDrop = (wrapperRef: RefObject<HTMLDivElement>) => {
  const { project } = useReactFlow();
  const { nodes, setNodes } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const bounds = wrapperRef.current?.getBoundingClientRect();
    const dataStr = event.dataTransfer.getData('application/reactflow');
    
    if (!dataStr || !bounds) return;

    const { nodeType, actionType, label } = JSON.parse(dataStr);
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position,
      data: { label, actionType, config: {} },
    };
    setNodes(nodes.concat(newNode));
  }, [project, nodes, setNodes, wrapperRef]);

  return { onDragOver, onDrop };
};