import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function DuplicateWarningModal({ isOpen, onClose, onProceed, duplicates = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Potential Duplicate Issues Detected" maxWidth="max-w-xl">
      <p className="text-xs text-slate-600 mb-4">
        We found existing tickets that share high semantic or text similarity with your report. Please review them before creating a new duplicate.
      </p>

      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
        {duplicates.map((dup) => (
          <div key={dup.issueKey} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-sky-600">{dup.issueKey}</span>
              <p className="text-xs text-slate-800 font-medium">{dup.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                {dup.similarityPercentage}% Match
              </Badge>
              <Badge className="bg-slate-100 text-slate-600 border-slate-200">{dup.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel & Edit
        </Button>
        <Button variant="primary" onClick={onProceed}>
          Proceed Anyway
        </Button>
      </div>
    </Modal>
  );
}