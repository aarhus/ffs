
import { User, Role, Goal, Workout, Habit, Measurement, NutritionLog, Session, Chat, Message, Announcement } from '../types';

// The admin/trainer account is kept as a starting point for the application.
export const users: User[] = [
  {
    id: 'user_trainer',
    role: Role.TRAINER,
    name: 'Fitcoach Admin',
    email: 'admin@fitcoach.ai',
    avatar: 'https://i.pravatar.cc/150?u=user_trainer_admin',
    password: 'password123',
  },
  {
    id: 'user_client_finlay',
    role: Role.CLIENT,
    name: 'Finlay Hampton',
    email: 'finlay.m.hampton@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=finlay.m.hampton@gmail.com',
    password: 'password123',
  }
];

// All other data arrays are cleared to provide a clean slate for the production app.
export const goals: Goal[] = [];

export const workouts: Workout[] = [];

export const habits: Habit[] = [];

export const measurements: Measurement[] = [];

export const nutritionLogs: NutritionLog[] = [];

export const sessions: Session[] = [];

export const chats: Chat[] = [];

export const messages: Message[] = [];

export const announcements: Announcement[] = [];