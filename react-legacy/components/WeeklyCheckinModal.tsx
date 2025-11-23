
import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { Goal } from '../types';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGoals: Goal[];
  onUpdateGoals: (updates: { goalId: string; newCurrent: number }[]) => void;
}

export const WeeklyCheckinModal: React.FC<WeeklyCheckinModalProps> = ({ isOpen, onClose, activeGoals, onUpdateGoals }) => {
  const [progress, setProgress] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    if (isOpen) {
      const initialProgress = activeGoals.reduce((acc, goal) => {
        acc[goal.id] = goal.current;
        return acc;
      }, {} as Record<string, number | '' >);
      setProgress(initialProgress);
    }
  }, [isOpen, activeGoals]);
  
  const handleProgressChange = (goalId: string, value: string) => {
    setProgress(prev => ({ ...prev, [goalId]: value === '' ? '' : parseFloat(value) }));
  };

  const handleSubmit = () => {
    const updates = Object.entries(progress)
      .filter(([_, value]) => value !== '' && !isNaN(Number(value)))
      .map(([goalId, value]) => ({
        goalId,
        newCurrent: Number(value),
      }));

    if (updates.length > 0) {
      onUpdateGoals(updates);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weekly Check-in">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Update your current progress for each of your active goals.</p>
        {activeGoals.map(goal => (
          <div key={goal.id}>
            <label className="block text-sm font-medium text-foreground mb-1">{goal.title}</label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={progress[goal.id] ?? ''} 
                onChange={(e) => handleProgressChange(goal.id, e.target.value)} 
                className="w-full bg-muted border-input rounded-md px-3 py-2" 
                placeholder={`Current: ${goal.current}${goal.metric}`}
              />
              <span className="text-muted-foreground text-sm">/ {goal.target}{goal.metric}</span>
            </div>
          </div>
        ))}
         <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 mt-4">
          Submit Check-in
        </button>
      </div>
    </Modal>
  );
};
