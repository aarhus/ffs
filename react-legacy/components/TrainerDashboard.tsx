
import React from 'react';
import { User, Session, Chat, Workout } from '../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './common/Card';
import { CheckCircle2Icon, ChevronRightIcon, MessageSquareIcon, TrophyIcon, XCircleIcon } from './Icons';
import { users as allUsers } from '../data/mockData';
import { format, parseISO, isToday } from 'date-fns';

interface TrainerDashboardProps {
  currentUser: User;
  sessions: Session[];
  chats: Chat[];
  workouts: Workout[];
}

interface ClientCompliance {
    user: User;
    compliance: number;
    isLow: boolean;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ currentUser, sessions, chats, workouts }) => {
  
  const todaySessions = sessions.filter(s => isToday(parseISO(s.date)));
  const unreadDMs = chats.filter(c => c.unreadCount[currentUser.id] > 0);
  
  const recentPRs = workouts
    .flatMap(w => w.exercises.map(e => ({...e, userId: w.userId, workoutDate: w.date})))
    .filter(e => e.isPR)
    .sort((a,b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
    .slice(0, 5)
    .map(pr => ({
        ...pr,
        user: allUsers.find(u => u.id === pr.userId)
    }));

  // Mock compliance data
  const clientCompliance: ClientCompliance[] = allUsers
    .filter(u => u.role === 'CLIENT')
    .map((user, index) => {
        const compliance = [75, 55, 90][index % 3];
        return {
            user,
            compliance,
            isLow: compliance < 60
        }
    })
    .sort((a,b) => (a.isLow === b.isLow) ? 0 : a.isLow ? -1 : 1);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        Trainer Dashboard
      </h1>
      <p className="text-muted-foreground">Here's what's happening today, {currentUser.name.split(' ')[0]}.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{todaySessions.length}</p>
                <p className="text-sm text-muted-foreground">sessions scheduled</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{unreadDMs.length}</p>
                <p className="text-sm text-muted-foreground">conversations need attention</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Low Compliance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{clientCompliance.filter(c => c.isLow).length}</p>
                <p className="text-sm text-muted-foreground">clients to check in with</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length > 0 ? (
                <ul className="space-y-4">
                  {todaySessions.map(session => (
                    <li key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(session.date), 'p')} - {session.location}
                        </p>
                      </div>
                       <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions scheduled for today.</p>
              )}
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <CardTitle>Client Compliance</CardTitle>
              <CardDescription>Workout & Nutrition logging adherence last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {clientCompliance.map(({user, compliance, isLow}) => (
                        <li key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${isLow ? 'text-destructive' : 'text-green-500'}`}>{compliance}%</span>
                                {isLow ? <XCircleIcon className="w-5 h-5 text-destructive"/> : <CheckCircle2Icon className="w-5 h-5 text-green-500"/>}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Messages</CardTitle>
            </CardHeader>
            <CardContent>
                {unreadDMs.length > 0 ? (
                    <ul className="space-y-3">
                        {unreadDMs.map(chat => {
                            const client = allUsers.find(u => u.id !== currentUser.id && chat.participants.includes(u.id));
                            return (
                                <li key={chat.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <img src={client?.avatar} alt={client?.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{client?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                        {chat.unreadCount[currentUser.id]}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New PRs</CardTitle>
            </CardHeader>
            <CardContent>
                 {recentPRs.length > 0 ? (
                    <ul className="space-y-4">
                        {recentPRs.map(pr => (
                             <li key={pr.id} className="flex items-start space-x-3">
                                <TrophyIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">{pr.user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{pr.name}: <span className="font-semibold text-foreground">{pr.weight}kg</span> for {pr.reps} reps</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent PRs.</p>
                 )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
