
import React, { useState } from 'react';
import { User, Session, Goal, Habit, Workout, Measurement, GoalStatus, Exercise, Screen } from '../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './common/Card';
import { AppleIcon, CheckCircle2Icon, ChevronRightIcon, DumbbellIcon, FlameIcon, FootprintsIcon, BedDoubleIcon, DropletsIcon, PlusCircleIcon, TargetIcon, TrophyIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Modal } from './common/Modal';
import { LogNutritionModal } from './LogNutritionModal';

// --- Prop Types ---
interface ClientHomeProps {
  currentUser: User;
  sessions: Session[];
  goals: Goal[];
  habits: Habit[];
  workouts: Workout[];
  measurements: Measurement[];
  onAddMeasurement: (measurement: Omit<Measurement, 'id' | 'userId' | 'date'>) => void;
  onUpdateGoal: (goalId: string, newCurrent: number) => void;
  onAddNutritionLog: (log: { type: 'meal' | 'snack' | 'water'; description?: string; protein?: number; waterAmount?: number }) => void;
  onGoToAddWorkout: () => void;
}

// --- Helper & Sub-components ---
const HabitIcon: React.FC<{ name: Habit['name'], className?: string }> = ({ name, className }) => {
  switch (name) {
    case 'Protein': return <FlameIcon className={className} />;
    case 'Water': return <DropletsIcon className={className} />;
    case 'Steps': return <FootprintsIcon className={className} />;
    case 'Sleep': return <BedDoubleIcon className={className} />;
    default: return null;
  }
};

const QuickLogButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 text-center group">
        <div className="w-16 h-16 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </button>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

const FormButton: React.FC<{children: React.ReactNode, onClick: () => void}> = ({ children, onClick }) => (
    <button onClick={onClick} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors">
        {children}
    </button>
);

// --- Main Component ---
export const ClientHome: React.FC<ClientHomeProps> = ({ 
    currentUser, sessions, goals, habits, workouts, measurements, 
    onAddMeasurement, onUpdateGoal, onAddNutritionLog, onGoToAddWorkout
}) => {
  
  type ModalType = 'nutrition' | 'goal' | 'measurement';
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  // --- Form States ---
  const [goalId, setGoalId] = useState('');
  const [goalCurrent, setGoalCurrent] = useState(0);
  const [bodyweight, setBodyweight] = useState(0);

  const activeGoals = goals.filter(g => g.userId === currentUser.id && g.status === GoalStatus.ACTIVE);
  
  // --- Submit Handlers ---
  const handleUpdateGoal = () => {
    if (goalId) onUpdateGoal(goalId, goalCurrent);
    setGoalId(''); setGoalCurrent(0);
    setActiveModal(null);
  }
  const handleAddMeasurement = () => {
    onAddMeasurement({ bodyweight });
    setBodyweight(0);
    setActiveModal(null);
  }

  // --- Data for Charts & Cards ---
  const today = new Date().toISOString().split('T')[0];
  const upcomingSession = sessions.find(s => s.date.startsWith(today) && s.attendees.includes(currentUser.id));
  const recentPRs = workouts
    .filter(w => w.userId === currentUser.id)
    .flatMap(w => w.exercises)
    .filter(e => e.isPR)
    .slice(0, 2);

  const weightData = measurements
    .filter(m => m.userId === currentUser.id && m.bodyweight)
    .map(m => ({
        date: format(parseISO(m.date), 'MMM d'),
        weight: m.bodyweight
    }));

  return (
    <>
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        Hello, {currentUser.name.split(' ')[0]}!
      </h1>
      
      {upcomingSession && (
        <Card className="bg-primary text-primary-foreground dark:bg-primary-dark dark:text-background">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{upcomingSession.title}</p>
              <p className="text-sm opacity-80">
                {format(parseISO(upcomingSession.date), 'p')} - {upcomingSession.location}
              </p>
            </div>
            <ChevronRightIcon className="w-6 h-6" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLogButton icon={<DumbbellIcon className="w-8 h-8"/>} label="Log Workout" onClick={onGoToAddWorkout}/>
        <QuickLogButton icon={<AppleIcon className="w-8 h-8"/>} label="Log Meal" onClick={() => setActiveModal('nutrition')}/>
        <QuickLogButton icon={<TargetIcon className="w-8 h-8"/>} label="Update Goal" onClick={() => setActiveModal('goal')}/>
        <QuickLogButton icon={<PlusCircleIcon className="w-8 h-8"/>} label="Add Measurement" onClick={() => setActiveModal('measurement')}/>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Habits</CardTitle>
          <CardDescription>Keep up the great work!</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.filter(h => h.userId === currentUser.id).map(habit => (
             <div key={habit.id} className="flex items-center space-x-3 bg-muted p-3 rounded-lg">
                <div className="p-2 bg-background rounded-full">
                    <HabitIcon name={habit.name} className="w-6 h-6 text-primary dark:text-primary-dark" />
                </div>
                <div>
                    <p className="font-semibold text-sm">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">{habit.current} / {habit.target} {habit.unit}</p>
                </div>
             </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.filter(g => g.userId === currentUser.id && g.status === 'ACTIVE').map(goal => {
              const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-sm">{goal.title}</span>
                    <span className="text-xs text-muted-foreground">{goal.current}{goal.metric} / {goal.target}{goal.metric}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary dark:bg-primary-dark h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent PRs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPRs.length > 0 ? (
                <ul className="space-y-3">
                    {recentPRs.map(pr => (
                        <li key={pr.id} className="flex items-center space-x-3">
                            <TrophyIcon className="w-5 h-5 text-amber-500" />
                            <p className="text-sm font-medium">{pr.name}: <span className="text-primary dark:text-primary-dark font-semibold">{pr.weight}kg</span> for {pr.reps} reps</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No recent PRs. Keep pushing!</p>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Bodyweight Trend</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']}/>
                    <Tooltip contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))'
                    }}/>
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
       </Card>
    </div>
    
    {/* --- Modals --- */}
    <LogNutritionModal isOpen={activeModal === 'nutrition'} onClose={() => setActiveModal(null)} onLog={onAddNutritionLog} />

    <Modal isOpen={activeModal === 'goal'} onClose={() => setActiveModal(null)} title="Update Goal Progress">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Select Goal</label>
                <select value={goalId} onChange={e => setGoalId(e.target.value)} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="" disabled>Choose a goal...</option>
                    {activeGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
            </div>
            {goalId && <FormInput label={`New Progress (${goals.find(g=>g.id===goalId)?.metric})`} type="number" value={goalCurrent || ''} onChange={e => setGoalCurrent(Number(e.target.value))} />}
            <FormButton onClick={handleUpdateGoal}>Update Progress</FormButton>
        </div>
    </Modal>
    <Modal isOpen={activeModal === 'measurement'} onClose={() => setActiveModal(null)} title="Add Measurement">
        <div className="space-y-4">
            <FormInput label="Bodyweight (kg)" type="number" placeholder="e.g., 68.5" value={bodyweight || ''} onChange={e => setBodyweight(Number(e.target.value))} />
            <FormButton onClick={handleAddMeasurement}>Save Measurement</FormButton>
        </div>
    </Modal>
    </>
  );
};