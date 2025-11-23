
import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { Goal } from '../types';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetGoal: (goal: Omit<Goal, 'id' | 'userId' | 'current' | 'status'>) => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ isOpen, onClose, onSetGoal }) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [metric, setMetric] = useState<'kg' | 'reps' | 'cm' | 'mins' | '%'>('kg');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title || !target || !dueDate) return;
    onSetGoal({
      title,
      target: Number(target),
      metric,
      dueDate: new Date(dueDate).toISOString(),
    });
    onClose();
    setTitle('');
    setTarget('');
    setMetric('kg');
    setDueDate('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set a New Goal">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Goal Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border-input rounded-md px-3 py-2" placeholder="e.g., Deadlift 150kg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Target</label>
                <input type="number" value={target} onChange={e => setTarget(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full bg-muted border-input rounded-md px-3 py-2" placeholder="150" />
            </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Metric</label>
                <select value={metric} onChange={e => setMetric(e.target.value as any)} className="w-full bg-muted border-input rounded-md px-3 py-2">
                    <option value="kg">kg</option>
                    <option value="reps">reps</option>
                    <option value="cm">cm</option>
                    <option value="mins">mins</option>
                    <option value="%">%</option>
                </select>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-muted border-input rounded-md px-3 py-2" />
        </div>
        <button onClick={handleSubmit} disabled={!title || !target || !dueDate} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
          Save Goal
        </button>
      </div>
    </Modal>
  );
};
