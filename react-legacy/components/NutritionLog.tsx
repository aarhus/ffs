

import React, { useState } from 'react';
// FIX: Aliased NutritionLog type to avoid name collision with the component.
import { User, NutritionLog as NutritionLogType, Habit } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './common/Card';
import { AppleIcon, CheckCircle2Icon, FlameIcon, PlusCircleIcon, DropletsIcon } from './Icons';
import { format, parseISO } from 'date-fns';
import { LogNutritionModal } from './LogNutritionModal';
import { EmptyState } from './common/EmptyState';

interface NutritionLogProps {
  currentUser: User;
  logs: NutritionLogType[];
  habits: Habit[];
  onAddNutritionLog: (log: { type: 'meal' | 'snack' | 'water'; description?: string; protein?: number; waterAmount?: number }) => void;
}

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, color }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
      <circle
        className="text-muted"
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

const MacroCircle: React.FC<{ habit: Habit, icon: React.ReactNode, color: string }> = ({ habit, icon, color}) => {
    const progress = Math.min(100, (habit.current / habit.target) * 100);
    return (
         <div className="relative flex flex-col items-center">
            <ProgressRing radius={50} stroke={8} progress={progress} color={color} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                {icon}
            </div>
            <p className="text-sm font-semibold mt-2">{habit.name}</p>
            <p className="text-xs text-muted-foreground">{habit.current} / {habit.target} {habit.unit}</p>
        </div>
    );
}

export const NutritionLog: React.FC<NutritionLogProps> = ({ currentUser, logs, habits, onAddNutritionLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const todayLog = logs.find(log => log.userId === currentUser.id && format(parseISO(log.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const proteinHabit = habits.find(h => h.userId === currentUser.id && h.name === 'Protein');
  const waterHabit = habits.find(h => h.userId === currentUser.id && h.name === 'Water');
  
  // Mock weekly compliance
  const weeklyCompliance = 78;

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Nutrition</h1>
        <p className="text-muted-foreground">Log your meals and track your targets.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
           {proteinHabit && <MacroCircle habit={proteinHabit} icon={<FlameIcon className="w-6 h-6 text-red-500"/>} color="hsl(0 84.2% 60.2%)" />}
           {waterHabit && <MacroCircle habit={waterHabit} icon={<DropletsIcon className="w-6 h-6 text-blue-500"/>} color="hsl(210 84.2% 60.2%)" />}
           {/* Mock Fibre and Calories */}
           <div className="text-center">
                <p className="text-3xl font-bold">{todayLog?.fibre || 28}g</p>
                <p className="text-sm text-muted-foreground">Fibre</p>
           </div>
           <div className="text-center">
                <p className="text-3xl font-bold">2,100</p>
                <p className="text-sm text-muted-foreground">Calories</p>
           </div>
        </CardContent>
        <CardFooter>
            <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2Icon className="w-5 h-5"/>
                <p className="text-sm font-medium">Weekly Compliance: {weeklyCompliance}%</p>
            </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Meal Log</CardTitle>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-primary/90">
                    <PlusCircleIcon className="w-4 h-4"/>
                    <span>Log Meal</span>
                </button>
            </div>
        </CardHeader>
        <CardContent>
            {todayLog && todayLog.meals.length > 0 ? (
                <ul className="space-y-4">
                    {todayLog.meals.map((meal, index) => (
                        <li key={index} className="flex items-start space-x-4 p-3 bg-muted rounded-lg">
                           <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center font-bold text-primary dark:text-primary-dark flex-shrink-0">{index + 1}</div>
                           <div>
                            {meal.text && <p className="font-medium text-sm">{meal.text}</p>}
                            {meal.photo && <img src={meal.photo} alt="meal" className="mt-2 rounded-lg max-w-xs"/>}
                           </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={<AppleIcon />}
                    title="No Meals Logged Today"
                    message="Log your first meal of the day to see it here."
                />
            )}
        </CardContent>
      </Card>

    </div>
    <LogNutritionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLog={onAddNutritionLog} />
    </>
  );
};