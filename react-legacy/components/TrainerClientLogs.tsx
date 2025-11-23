

import React, { useState } from 'react';
import { User, Workout } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './common/Card';
import { format, parseISO } from 'date-fns';
// FIX: Imported UsersIcon
import { DumbbellIcon, TrophyIcon, UsersIcon } from './Icons';
import { EmptyState } from './common/EmptyState';

interface TrainerClientLogsProps {
  currentUser: User;
  workouts: Workout[];
  clients: User[];
}

const ClientWorkoutCard: React.FC<{ workout: Workout }> = ({ workout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
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
      {isExpanded && (
        <CardContent>
            {workout.notes && <p className="text-sm italic text-muted-foreground mb-4 p-3 bg-muted rounded-md">{workout.notes}</p>}
            <ul className="space-y-4">
                {workout.exercises.map(exercise => (
                    <li key={exercise.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{exercise.name}</p>
                            {exercise.isPR && <TrophyIcon className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm mt-2 text-muted-foreground">
                            <span><strong className="text-foreground">Sets:</strong> {exercise.sets}</span>
                            <span><strong className="text-foreground">Reps:</strong> {exercise.reps}</span>
                            <span><strong className="text-foreground">Wt:</strong> {exercise.weight ? `${exercise.weight}kg` : 'BW'}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
      )}
    </Card>
  );
};


export const TrainerClientLogs: React.FC<TrainerClientLogsProps> = ({ currentUser, workouts, clients }) => {
  const [selectedClient, setSelectedClient] = useState<User | null>(clients[0] || null);

  const selectedClientWorkouts = workouts
    .filter(w => w.userId === selectedClient?.id)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Client Training Logs</h1>
        <p className="text-muted-foreground">Review your clients' workout history and progress.</p>
      </div>
      
      <div className="flex space-x-2 border-b border-border pb-2 overflow-x-auto">
        {clients.map(client => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${selectedClient?.id === client.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {client.name}
          </button>
        ))}
      </div>

      <main>
        {selectedClient ? (
          <div>
            <div className="flex items-center space-x-3 mb-4">
                <img src={selectedClient.avatar} alt={selectedClient.name} className="w-12 h-12 rounded-full" />
                <h2 className="text-xl font-semibold">{selectedClient.name}'s Workouts</h2>
            </div>
            {selectedClientWorkouts.length > 0 ? (
              <div className="space-y-4">
                {selectedClientWorkouts.map(workout => (
                  <ClientWorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                    <EmptyState 
                        icon={<DumbbellIcon />}
                        title="No Workouts Logged"
                        message={`${selectedClient.name} hasn't logged any workouts yet.`}
                    />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
           <Card>
                <CardContent>
                    <EmptyState
                        icon={<UsersIcon />}
                        title="No Client Selected"
                        message="Select a client from the list above to view their training logs."
                    />
                </CardContent>
            </Card>
        )}
      </main>

    </div>
  );
};