
import React, { useState, useMemo } from 'react';
import { Exercise } from '../types';
import { exerciseLibrary, ExerciseInfo } from '../data/exerciseLibrary';
import { ChevronLeftIcon, DumbbellIcon, SearchIcon, PlusIcon, MinusIcon, XIcon, VideoIcon, PlusCircleIcon } from './Icons';

interface AddWorkoutProps {
    onAddWorkout: (workout: { notes?: string; perceivedExertion: number; exercises: Exercise[] }) => void;
    onBack: () => void;
}

type ExerciseDetails = Omit<Exercise, 'id' | 'name' | 'instructions' | 'videoLink' | 'isPR'>;

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex-shrink-0 whitespace-nowrap ${
            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
    >
        {label}
    </button>
);

const WorkoutExerciseCard: React.FC<{
    exercise: ExerciseInfo;
    details: ExerciseDetails;
    onDetailChange: (id: string, field: keyof ExerciseDetails, value: any) => void;
    onRemove: (id: string) => void;
}> = ({ exercise, details, onDetailChange, onRemove }) => {
    return (
        <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-md">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                </div>
                <button onClick={() => onRemove(exercise.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Sets</label>
                    <input type="number" value={details.sets} onChange={e => onDetailChange(exercise.id, 'sets', Number(e.target.value))} className="w-full bg-background border-input rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-sm" />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Reps</label>
                    <input type="text" value={details.reps} onChange={e => onDetailChange(exercise.id, 'reps', e.target.value)} className="w-full bg-background border-input rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-sm" />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Weight (kg)</label>
                    <input type="number" value={details.weight} onChange={e => onDetailChange(exercise.id, 'weight', Number(e.target.value))} className="w-full bg-background border-input rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-sm" />
                </div>
            </div>
        </div>
    );
};


export const AddWorkout: React.FC<AddWorkoutProps> = ({ onAddWorkout, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<ExerciseInfo[]>([]);
    const [exerciseDetails, setExerciseDetails] = useState<Record<string, ExerciseDetails>>({});
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [workoutRPE, setWorkoutRPE] = useState(7);
    
    const equipmentFilters = ['all', 'none', 'minimal', 'gym'] as const;
    type EquipmentFilter = typeof equipmentFilters[number];
    const muscleFilters = ['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Full Body', 'Cardio', 'Other'] as const;
    type MuscleFilter = typeof muscleFilters[number];

    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentFilter>('all');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleFilter>('all');

    const addExercise = (exercise: ExerciseInfo) => {
        if (selectedExercises.some(e => e.id === exercise.id)) return;
        
        setSelectedExercises(prev => [...prev, exercise]);
        setExerciseDetails(prev => ({
            ...prev,
            [exercise.id]: { sets: 3, reps: '10', weight: 0 }
        }));
    };
    
    const removeExercise = (exerciseId: string) => {
        setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
        const newDetails = {...exerciseDetails};
        delete newDetails[exerciseId];
        setExerciseDetails(newDetails);
    };

    const handleDetailChange = (id: string, field: keyof ExerciseDetails, value: any) => {
        setExerciseDetails(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSaveWorkout = () => {
        const timestamp = Date.now();
        const finalExercises: Exercise[] = selectedExercises.map((info, index) => ({
            id: `${info.id}_${timestamp}_${index}`,
            name: info.name,
            videoLink: info.videoLink,
            instructions: info.instructions,
            ...exerciseDetails[info.id]
        }));
        
        onAddWorkout({
            notes: workoutNotes,
            exercises: finalExercises,
            perceivedExertion: workoutRPE,
        });
    };

    const filteredLibrary = useMemo(() => {
        return exerciseLibrary.filter(ex => {
            const matchesQuery = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEquipment = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
            const matchesMuscle = selectedMuscleGroup === 'all' || ex.muscleGroup === selectedMuscleGroup;
            return matchesQuery && matchesEquipment && matchesMuscle;
        });
    }, [searchQuery, selectedEquipment, selectedMuscleGroup]);
    
    return (
        <div className="flex flex-col h-full bg-background">
             <header className="p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-20">
                <div className="relative text-center">
                    <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-1">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold">Log Workout</h1>
                </div>
            </header>
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Panel: Current Workout */}
                <div className="w-full lg:w-1/2 xl:w-2/5 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
                    <h2 className="text-lg font-semibold p-4">Current Workout ({selectedExercises.length})</h2>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedExercises.length > 0 ? (
                             selectedExercises.map(ex => (
                                <WorkoutExerciseCard 
                                    key={ex.id}
                                    exercise={ex}
                                    details={exerciseDetails[ex.id]}
                                    onDetailChange={handleDetailChange}
                                    onRemove={removeExercise}
                                />
                             ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-10">
                                <DumbbellIcon className="w-12 h-12 mx-auto" />
                                <p className="mt-2 font-semibold">Add exercises from the library</p>
                                <p className="text-sm">Find and add exercises to build your workout.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-border space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Workout Notes</label>
                            <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)} rows={2} className="w-full bg-muted border-input rounded-md px-3 py-2" placeholder="How did the session feel?"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Perceived Exertion (RPE): {workoutRPE}/10</label>
                             <input type="range" min="1" max="10" value={workoutRPE} onChange={e => setWorkoutRPE(Number(e.target.value))} className="w-full" />
                        </div>
                        <button onClick={handleSaveWorkout} disabled={selectedExercises.length === 0} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg disabled:opacity-50">
                            Save Workout
                        </button>
                    </div>
                </div>

                {/* Right Panel: Exercise Library */}
                 <div className="w-full lg:w-1/2 xl:w-3/5 flex flex-col">
                    <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input type="text" placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-muted border-input rounded-md pl-10 pr-4 py-2" />
                        </div>
                         <div className="mt-3">
                            <p className="text-xs font-semibold mb-2 text-muted-foreground">Equipment</p>
                            <div className="flex space-x-2 overflow-x-auto pb-1 -mb-1">
                                {equipmentFilters.map(e => <FilterButton key={e} label={e.charAt(0).toUpperCase() + e.slice(1)} isActive={selectedEquipment === e} onClick={() => setSelectedEquipment(e)} />)}
                            </div>
                        </div>
                         <div className="mt-3">
                            <p className="text-xs font-semibold mb-2 text-muted-foreground">Muscle Group</p>
                            <div className="flex space-x-2 overflow-x-auto pb-1 -mb-1">
                                {muscleFilters.map(m => <FilterButton key={m} label={m} isActive={selectedMuscleGroup === m} onClick={() => setSelectedMuscleGroup(m)} />)}
                            </div>
                        </div>
                    </div>
                     <div className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                             {filteredLibrary.map(exercise => {
                                const isAdded = selectedExercises.some(e => e.id === exercise.id);
                                return (
                                <li key={exercise.id} className="bg-muted p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{exercise.name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 bg-background rounded-full">{exercise.muscleGroup}</span>
                                            {exercise.videoLink && <a href={exercise.videoLink} target="_blank" rel="noopener noreferrer"><VideoIcon className="w-4 h-4 text-primary"/></a>}
                                        </div>
                                    </div>
                                    <button onClick={() => isAdded ? removeExercise(exercise.id) : addExercise(exercise)} className={`p-2 rounded-full transition-colors ${isAdded ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                                        {isAdded ? <MinusIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                                    </button>
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
