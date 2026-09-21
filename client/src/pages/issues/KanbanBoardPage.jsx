/**
 * @file KanbanBoardPage.jsx
 * @description Drag and drop Sprint Kanban Workboard with optimistic updates.
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import KanbanColumn from '../../components/kanban/KanbanColumn';
import Spinner from '../../components/common/Spinner';
import { ISSUE_STATUS } from '../../config/constants';

const COLUMNS = [
  ISSUE_STATUS?.OPEN || 'Open',
  ISSUE_STATUS?.IN_PROGRESS || 'In Progress',
  ISSUE_STATUS?.TESTING || 'Testing',
  ISSUE_STATUS?.RESOLVED || 'Resolved',
  ISSUE_STATUS?.CLOSED || 'Closed',
];

// Helper to reliably extract issues array regardless of response shape
const extractIssuesFromResponse = (res) => {
  if (!res) return [];
  const body = res.data !== undefined ? res.data : res;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.issues)) return body.issues;
  if (Array.isArray(body?.data?.issues)) return body.data.issues;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

// Normalize status strings (e.g., "in_progress", "In Progress", "IN-PROGRESS" -> "inprogress")
const normalizeStatus = (str) =>
  String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

export default function KanbanBoardPage() {
  const [boardData, setBoardData] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const notify = (msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  };

  const loadBoardIssues = async () => {
    try {
      const res = await issueService.getAll({ limit: 100 });
      const issues = extractIssuesFromResponse(res);

      const initialColumns = {};
      COLUMNS.forEach((col) => {
        const normalizedCol = normalizeStatus(col);
        initialColumns[col] = issues.filter(
          (i) => normalizeStatus(i.status) === normalizedCol
        );
      });

      setBoardData(initialColumns);
    } catch (e) {
      console.error('Error loading Kanban issues:', e);
      notify('Failed to load Kanban board issues', 'error');
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

    const previousState = { ...boardData };

    const sourceItems = Array.from(boardData[sourceCol] || []);
    const destItems = sourceCol === destCol ? sourceItems : Array.from(boardData[destCol] || []);
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (!movedItem) return;

    movedItem.status = destCol;
    destItems.splice(destination.index, 0, movedItem);

    setBoardData({
      ...boardData,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    });

    try {
      await issueService.changeStatus(draggableId, destCol);
      notify(`Moved to ${destCol}`, 'success');
    } catch (err) {
      setBoardData(previousState);
      notify(err.response?.data?.message || 'Workflow state transition rejected', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="m-8 text-sky-600" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Kanban Workboard</h1>
        <p className="text-xs text-slate-500">
          Drag and drop defects across workflow lanes. Backend strictly validates state transitions.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 pb-4 overflow-x-auto">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              columnId={col}
              title={col}
              issues={boardData[col] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}