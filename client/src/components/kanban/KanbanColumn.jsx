import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ columnId, title, issues = [] }) {
  return (
    <div className="flex flex-col p-3 w-72 bg-slate-100 rounded-xl shrink-0">
      <div className="flex items-center justify-between px-1 mb-3">
        <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">{title}</h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
          {issues.length}
        </span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[450px] rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-200/70' : ''
            }`}
          >
            {issues.map((issue, index) => (
              <KanbanCard key={issue._id} issue={issue} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}