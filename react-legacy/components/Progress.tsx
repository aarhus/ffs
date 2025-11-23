

import React, { useState } from 'react';
import { User, Measurement, Workout, Habit, Exercise } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './common/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FlameIcon, FootprintsIcon, TrophyIcon, DropletsIcon, BedDoubleIcon, PlusCircleIcon } from './Icons';
import { Modal } from './common/Modal';
import { EmptyState } from './common/EmptyState';

// --- Prop Types ---
interface ProgressProps {
  currentUser: User;
  measurements: Measurement[];
  workouts: Workout[];
  habits: Habit[];
  onAddMeasurement: (measurement: Omit<Measurement, 'id' | 'userId' | 'date'>) => void;
}

// --- Helper & Sub-components ---
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

const FormButton: React.FC<{children: React.ReactNode, onClick: () => void, disabled?: boolean}> = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
    </button>
);


// --- Main Component ---
export const Progress: React.FC<ProgressProps> = ({ currentUser, measurements, workouts, habits, onAddMeasurement }) => {
  
  type ModalType = 'measurement';
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  
  // --- Form States ---
  const [bodyweight, setBodyweight] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [hips, setHips] = useState<number | ''>('');

  const resetMeasurementForm = () => {
    setBodyweight(''); setWaist(''); setHips('');
  };

  // --- Submit Handlers ---
  const handleAddMeasurement = () => {
    onAddMeasurement({ 
        bodyweight: bodyweight ? Number(bodyweight) : undefined, 
        waist: waist ? Number(waist) : undefined, 
        hips: hips ? Number(hips) : undefined
    });
    resetMeasurementForm();
    setActiveModal(null);
  };

  // --- Chart & Display Data ---
  const weightData = measurements
    .filter(m => m.userId === currentUser.id && m.bodyweight)
    .map(m => ({
        date: format(parseISO(m.date), 'MMM d'),
        weight: m.bodyweight,
        waist: m.waist,
        hips: m.hips,
    }));
    
  const topLifts = workouts
    .filter(w => w.userId === currentUser.id)
    .flatMap(w => w.exercises)
    .filter(e => e.isPR && e.weight && e.weight > 0)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 5);


  const habitStreaks = habits.filter(h => h.userId === currentUser.id);

  const HabitIcon: React.FC<{ name: Habit['name'], className?: string }> = ({ name, className }) => {
    switch (name) {
      case 'Protein': return <FlameIcon className={className} />;
      case 'Water': return <DropletsIcon className={className} />;
      case 'Steps': return <FootprintsIcon className={className} />;
      case 'Sleep': return <BedDoubleIcon className={className} />;
      default: return null;
    }
  };

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Progress</h1>
            <p className="text-muted-foreground">Visualize your hard work and achievements.</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => setActiveModal('measurement')} className="flex items-center space-x-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark px-3 py-2 rounded-lg font-semibold text-sm hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <PlusCircleIcon className="w-5 h-5"/>
                <span>Log Measurement</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Bodyweight & Measurements</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                        <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="waist" name="Waist (cm)" stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Top Lifts (PRs)</CardTitle>
                <CardDescription>Your all-time personal bests.</CardDescription>
            </CardHeader>
            <CardContent>
                {topLifts.length > 0 ? (
                    <ul className="space-y-4">
                        {topLifts.map(lift => (
                            <li key={lift.id} className="flex items-center space-x-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                                    <TrophyIcon className="w-6 h-6 text-amber-500"/>
                                </div>
                                <div>
                                    <p className="font-semibold">{lift.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{lift.weight}kg</span> for {lift.reps} reps
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState 
                        icon={<TrophyIcon />}
                        title="No PRs Yet"
                        message="Log some workouts to see your top lifts and personal records here!"
                    />
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Habit Streaks</CardTitle>
            <CardDescription>Current active streaks.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {habitStreaks.map(habit => (
                <div key={habit.id} className="bg-muted p-4 rounded-lg flex flex-col items-center text-center">
                    <HabitIcon name={habit.name} className="w-8 h-8 mb-2 text-primary dark:text-primary-dark" />
                    <p className="text-2xl font-bold">{habit.streak}</p>
                    <p className="text-sm text-muted-foreground">day streak</p>
                    <p className="text-xs font-semibold mt-1">{habit.name}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>

    {/* --- Modals --- */}
    <Modal isOpen={activeModal === 'measurement'} onClose={() => setActiveModal(null)} title="Log New Measurement">
        <div className="space-y-4">
            <FormInput label="Bodyweight (kg)" type="number" placeholder="e.g., 68.5" value={bodyweight} onChange={e => setBodyweight(e.target.value === '' ? '' : parseFloat(e.target.value))} />
            <FormInput label="Waist (cm)" type="number" placeholder="e.g., 77" value={waist} onChange={e => setWaist(e.target.value === '' ? '' : parseFloat(e.target.value))} />
            <FormInput label="Hips (cm)" type="number" placeholder="e.g., 94" value={hips} onChange={e => setHips(e.target.value === '' ? '' : parseFloat(e.target.value))} />
            <FormButton onClick={handleAddMeasurement} disabled={!bodyweight && !waist && !hips}>Save Measurement</FormButton>
        </div>
    </Modal>
    </>
  );
};