import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import KanbanColumn from '../../components/kanban/KanbanColumn';
import Spinner from '../../components/common/Spinner';
import { ISSUE_STATUS } from '../../config/constants';

const COLUMNS = [
  ISSUE_STATUS.OPEN,
  ISSUE_STATUS.IN_PROGRESS,
  ISSUE_STATUS.TESTING,
  ISSUE_STATUS.RESOLVED,
  ISSUE_STATUS.CLOSED,
];

export default function KanbanPage() {
  const [boardData, setBoardData] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadBoardIssues = async () => {
    try {
      const res = await issueService.getAll({ limit: 100 });
      const issues = res.data.data.issues || [];

      const initialColumns = {};
      COLUMNS.forEach((col) => {
        initialColumns[col] = issues.filter((i) => i.status === col);
      });
      setBoardData(initialColumns);
    } catch (e) {
      addToast('Failed to load Kanban board issues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardIssues();
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    // Snapshot current state for rollback
    const previousState = { ...boardData };

    // Optimistic UI update
    const sourceItems = Array.from(boardData[sourceCol]);
    const destItems = sourceCol === destCol ? sourceItems : Array.from(boardData[destCol]);
    const [movedItem] = sourceItems.splice(source.index, 1);

    movedItem.status = destCol;
    destItems.splice(destination.index, 0, movedItem);

    setBoardData({
      ...boardData,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    });

    // Invoke server status validation
    try {
      await issueService.changeStatus(draggableId, destCol);
      addToast(`Moved to ${destCol}`, 'success');
    } catch (err) {
      // Revert optimistic change on authorization / state machine rejection
      setBoardData(previousState);
      addToast(err.response?.data?.message || 'Workflow state transition rejected', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Kanban Workboard</h1>
        <p className="text-xs text-slate-500">
          Drag and drop defects across workflow lanes. Backend strictly validates state transitions.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col} columnId={col} title={col} issues={boardData[col] || []} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}