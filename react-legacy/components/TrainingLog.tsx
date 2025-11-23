

import React, { useState } from 'react';
import { User, Workout, Exercise } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './common/Card';
import { format, parseISO } from 'date-fns';
import { DumbbellIcon, PlusCircleIcon, TrophyIcon, VideoIcon, ChevronDownIcon } from './Icons';
import { EmptyState } from './common/EmptyState';

interface TrainingLogProps {
  currentUser: User;
  workouts: Workout[];
  onStartWorkout: () => void;
}

const ExerciseDetail: React.FC<{exercise: Exercise}> = ({ exercise }) => (
    <div className="border-t border-border mt-3 pt-3 space-y-2">
        {exercise.instructions && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{exercise.instructions}</p>}
        {exercise.videoLink && (
            <a href={exercise.videoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-xs text-primary dark:text-primary-dark hover:underline">
                <VideoIcon className="w-4 h-4"/>
                <span>Watch Form Video</span>
            </a>
        )}
    </div>
);


export const TrainingLog: React.FC<TrainingLogProps> = ({ currentUser, workouts, onStartWorkout }) => {
  const userWorkouts = workouts
    .filter(w => w.userId === currentUser.id)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(userWorkouts[0]?.id || null);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Record<string, boolean>>({});

  const toggleExercise = (exerciseId: string) => {
    setExpandedExerciseIds(prev => ({
        ...prev,
        [exerciseId]: !prev[exerciseId]
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Training Log</h1>
            <p className="text-muted-foreground">Your workout history.</p>
        </div>
        <button onClick={onStartWorkout} className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90">
            <PlusCircleIcon className="w-5 h-5"/>
            <span>Start Workout</span>
        </button>
      </div>

      {userWorkouts.length > 0 ? (
        userWorkouts.map(workout => (
            <Card key={workout.id}>
                <CardHeader onClick={() => setExpandedWorkoutId(expandedWorkoutId === workout.id ? null : workout.id)} className="cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{format(parseISO(workout.date), 'EEEE, MMMM d')}</CardTitle>
                            <CardDescription>
                                {workout.exercises.length} exercises
                                {workout.completed ? ` | RPE: ${workout.perceivedExertion}/10` : ' (Incomplete)'}
                            </CardDescription>
                        </div>
                        <DumbbellIcon className={`w-6 h-6 ${workout.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                </CardHeader>
                {expandedWorkoutId === workout.id && (
                    <CardContent>
                        {workout.notes && <p className="text-sm italic text-muted-foreground mb-4 p-3 bg-muted rounded-md">{workout.notes}</p>}
                        <ul className="space-y-2">
                            {workout.exercises.map(exercise => {
                                const isExerciseExpanded = !!expandedExerciseIds[exercise.id];
                                return (
                                    <li key={exercise.id} className="p-3 bg-muted rounded-lg">
                                        <div onClick={() => toggleExercise(exercise.id)} className="cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{exercise.name}</p>
                                                <div className="flex items-center space-x-2">
                                                    {exercise.isPR && <TrophyIcon className="w-5 h-5 text-amber-500" />}
                                                    <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform ${isExerciseExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-sm mt-2 text-muted-foreground">
                                                <span><strong className="text-foreground">Sets:</strong> {exercise.sets}</span>
                                                <span><strong className="text-foreground">Reps:</strong> {exercise.reps}</span>
                                                <span><strong className="text-foreground">Wt:</strong> {exercise.weight ? `${exercise.weight}kg` : 'BW'}</span>
                                            </div>
                                        </div>
                                        {isExerciseExpanded && <ExerciseDetail exercise={exercise}/>}
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                )}
            </Card>
        ))
      ) : (
        <Card>
            <CardContent>
                <EmptyState
                    icon={<DumbbellIcon />}
                    title="No Workouts Logged Yet"
                    message="Start your fitness journey by logging your first workout session."
                    action={{ label: "Start Workout", onClick: onStartWorkout }}
                />
            </CardContent>
        </Card>
      )}

    </div>
  );
};