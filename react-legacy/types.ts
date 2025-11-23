

export enum Role {
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  LOGIN = 'LOGIN',
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar: string;
  password?: string;
  injuries?: string[];
  notes?: string;
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  metric: 'kg' | 'reps' | 'cm' | 'mins' | '%';
  target: number;
  current: number;
  dueDate: string;
  status: GoalStatus;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  videoLink?: string;
  instructions?: string;
  isPR?: boolean;
}

export interface Workout {
  id:string;
  userId: string;
  date: string;
  notes?: string;
  perceivedExertion: number; // 1-10 scale
  completed: boolean;
  exercises: Exercise[];
}

export interface Habit {
  id: string;
  userId: string;
  name: 'Protein' | 'Water' | 'Steps' | 'Sleep';
  target: number;
  current: number;
  unit: 'g' | 'ml' | 'steps' | 'hrs';
  frequency: 'daily' | 'weekly';
  streak: number;
}

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  bodyweight?: number;
  waist?: number;
  hips?: number;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  meals: { text?: string; photo?: string }[];
  protein: number;
  fibre: number;
  water: number;
}

export enum SessionType {
  ONE_ON_ONE = '1:1',
  CIRCUIT = 'CIRCUIT',
}

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  date: string; // ISO string
  capacity: number;
  location: string;
  attendees: string[]; // array of user IDs
  waitlist: string[]; // array of user IDs
}

export enum ChatType {
  DM = 'DM',
  GROUP = 'GROUP',
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string; // For group chats
  participants: string[]; // user IDs
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: { [userId: string]: number };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  image?: string;
  video?: string;
  createdAt: string;
  readBy: string[]; // user IDs
  pinned?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  sessionId?: string;
  createdAt: string;
  pinned?: boolean;
}

export type Screen = 
  | 'home'
  | 'coaching'
  | 'circuit'
  | 'training'
  | 'nutrition'
  | 'goals'
  | 'schedule'
  | 'progress'
  | 'dashboard'
  | 'addWorkout'
  | 'admin'
  | 'profile';