

import React, { useState } from 'react';
import { User, Goal, GoalStatus } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './common/Card';
import { PlusCircleIcon, TargetIcon, CheckCircle2Icon } from './Icons';
import { format, parseISO, differenceInDays } from 'date-fns';
import { NewGoalModal } from './NewGoalModal';
import { WeeklyCheckinModal } from './WeeklyCheckinModal';
import { EmptyState } from './common/EmptyState';

interface GoalsProps {
  currentUser: User;
  goals: Goal[];
  onAddNewGoal: (goalData: Omit<Goal, 'id' | 'userId' | 'current' | 'status'>) => void;
  onBulkUpdateGoals: (updates: { goalId: string; newCurrent: number }[]) => void;
}

const GoalCard: React.FC<{goal: Goal}> = ({ goal }) => {
    const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const daysLeft = differenceInDays(parseISO(goal.dueDate), new Date());
    const isCompleted = goal.status === GoalStatus.COMPLETED;

    return (
        <Card className={`${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                     <CardTitle className="text-md">{goal.title}</CardTitle>
                     {isCompleted && <CheckCircle2Icon className="w-6 h-6 text-green-500" />}
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-sm">{goal.current}{goal.metric} / {goal.target}{goal.metric}</span>
                    <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className={`${isCompleted ? 'bg-green-500' : 'bg-primary dark:bg-primary-dark'} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                  </div>
            </CardContent>
            {!isCompleted && (
                <CardFooter>
                     <p className="text-xs text-muted-foreground">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'} - Due on {format(parseISO(goal.dueDate), 'MMM d')}
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}

export const Goals: React.FC<GoalsProps> = ({ currentUser, goals, onAddNewGoal, onBulkUpdateGoals }) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  const activeGoals = goals.filter(g => g.userId === currentUser.id && g.status === GoalStatus.ACTIVE);
  const completedGoals = goals.filter(g => g.userId === currentUser.id && g.status === GoalStatus.COMPLETED);

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Track your progress and stay motivated.</p>
        </div>
        <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90">
            <PlusCircleIcon className="w-5 h-5"/>
            <span>Set New Goal</span>
        </button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Weekly Check-in</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Update your progress and reflect on your week to stay on track with your goals.</p>
            <button onClick={() => setIsCheckinModalOpen(true)} className="w-full md:w-auto bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark font-semibold py-2 px-4 rounded-lg">
                Complete Weekly Check-in
            </button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><TargetIcon className="w-5 h-5"/> <span>Active Goals</span></h2>
        {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
            </div>
        ) : (
            <Card>
              <CardContent>
                <EmptyState 
                    icon={<TargetIcon />}
                    title="No Active Goals"
                    message="Set a new goal to start tracking your progress."
                    action={{ label: "Set New Goal", onClick: () => setIsGoalModalOpen(true) }}
                />
              </CardContent>
            </Card>
        )}
      </div>

       <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><CheckCircle2Icon className="w-5 h-5"/> <span>Completed Goals</span></h2>
        {completedGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
            </div>
        ) : (
             <Card>
              <CardContent>
                 <EmptyState 
                    icon={<CheckCircle2Icon />}
                    title="No Completed Goals"
                    message="Keep working towards your active goals to see them here."
                />
              </CardContent>
            </Card>
        )}
      </div>

    </div>
    <NewGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSetGoal={onAddNewGoal} />
    <WeeklyCheckinModal isOpen={isCheckinModalOpen} onClose={() => setIsCheckinModalOpen(false)} activeGoals={activeGoals} onUpdateGoals={onBulkUpdateGoals} />
    </>
  );
};