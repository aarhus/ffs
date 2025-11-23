
import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { AppleIcon, CheckIcon, DropletsIcon } from './Icons';

interface LogNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (log: { type: 'meal' | 'snack' | 'water'; description?: string; protein?: number; waterAmount?: number }) => void;
}

type Tab = 'meal' | 'snack' | 'drink';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
        {label}
    </button>
);

export const LogNutritionModal: React.FC<LogNutritionModalProps> = ({ isOpen, onClose, onLog }) => {
  const [activeTab, setActiveTab] = useState<Tab>('meal');
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState<number | ''>('');

  const resetState = () => {
    setActiveTab('meal');
    setDescription('');
    setProtein('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmitMeal = () => {
    onLog({ type: 'meal', description, protein: Number(protein) });
    handleClose();
  };
  
  const handleSubmitSnack = () => {
    onLog({ type: 'snack', description, protein: Number(protein) });
    handleClose();
  }

  const handleLogWater = (amount: number) => {
    onLog({ type: 'water', waterAmount: amount });
    handleClose();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'meal':
      case 'snack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-muted border-input rounded-md px-3 py-2" placeholder={activeTab === 'meal' ? "e.g., Grilled Chicken Salad" : "e.g., Protein Bar"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={e => setProtein(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-muted border-input rounded-md px-3 py-2" placeholder="e.g., 30" />
            </div>
            <button onClick={activeTab === 'meal' ? handleSubmitMeal : handleSubmitSnack} disabled={!description} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm disabled:opacity-50">
              Log {activeTab === 'meal' ? 'Meal' : 'Snack'}
            </button>
          </div>
        );
      case 'drink':
        return (
          <div className="space-y-4 text-center">
            <DropletsIcon className="w-12 h-12 text-blue-500 mx-auto" />
            <p className="text-muted-foreground text-sm">Log your water intake quickly.</p>
            <div className="grid grid-cols-3 gap-2">
              {[250, 500, 750, 1000, 1250, 1500].map(amount => (
                <button key={amount} onClick={() => handleLogWater(amount)} className="bg-muted hover:bg-accent py-3 rounded-lg font-semibold text-foreground">
                  {amount}ml
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Nutrition">
      <div className="flex border-b border-border mb-4">
        <TabButton label="Meal" isActive={activeTab === 'meal'} onClick={() => setActiveTab('meal')} />
        <TabButton label="Snack" isActive={activeTab === 'snack'} onClick={() => setActiveTab('snack')} />
        <TabButton label="Drink" isActive={activeTab === 'drink'} onClick={() => setActiveTab('drink')} />
      </div>
      {renderContent()}
    </Modal>
  );
};
