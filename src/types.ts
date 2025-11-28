export enum Role {
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN',
}

export interface User {
  id: string | number;
  firebase_uid?: string;
  role: Role | string;
  name: string;
  email: string;
  avatar?: string | null;
  password?: string;
  injuries?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserInjury {
  id: number;
  user_id: number;
  injury_type: string;
  details: string | null;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | null;
  status: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
  date_reported: string;
  date_resolved: string | null;
}

export interface InjuryDefinition {
  id: number;
  name: string;
  category: string;
  description: string | null;
  affected_areas: string[];
  recommended_modifications: string[];
  is_active: boolean;
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
  reps?: string; // Legacy field for display
  min_reps?: number;
  max_reps?: number;
  weight?: number; // Legacy: use measurement_value instead
  measurement_value?: number; // Normalized value (e.g., seconds, meters, kg)
  measurement_type?: string; // ID from measurement_types table (e.g., 'measure_weight_kg')
  rest_seconds?: number;
  videoLink?: string;
  instructions?: string;
  isPR?: boolean;
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  notes?: string;
  perceivedExertion: number;
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
  date: string;
  capacity: number;
  location: string;
  attendees: string[];
  waitlist: string[];
}

export enum ChatType {
  DM = 'DM',
  GROUP = 'GROUP',
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  participants: string[];
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
  readBy: string[];
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
