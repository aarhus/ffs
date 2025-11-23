

import React, { useState } from 'react';
import { User, Session, SessionType, Role } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './common/Card';
import { CalendarIcon, PlusCircleIcon, UserIcon, UsersIcon } from './Icons';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { users as allUsers } from '../data/mockData';
import { Modal } from './common/Modal';
import { EmptyState } from './common/EmptyState';

interface ScheduleProps {
  currentUser: User;
  sessions: Session[];
  clients?: User[];
  onAddNewSession?: (session: Omit<Session, 'id'>) => void;
}

const SessionCard: React.FC<{session: Session, currentUser: User}> = ({ session, currentUser }) => {
    const isAttending = session.attendees.includes(currentUser.id);
    const isOnWaitlist = session.waitlist.includes(currentUser.id);
    const clientName = session.type === SessionType.ONE_ON_ONE 
        ? allUsers.find(u => session.attendees.includes(u.id) && u.role === Role.CLIENT)?.name 
        : null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <p className={`text-xs font-semibold uppercase ${session.type === SessionType.CIRCUIT ? 'text-purple-500' : 'text-blue-500'}`}>{session.type}</p>
                    <CardTitle className="text-md mt-1">{clientName ? `1:1 with ${clientName}` : session.title}</CardTitle>
                </div>
                {session.type === SessionType.CIRCUIT ? (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <UsersIcon className="w-5 h-5"/>
                        <span>{session.attendees.length} / {session.capacity}</span>
                    </div>
                ) : (
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                )}
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-sm">{format(parseISO(session.date), 'p')}</p>
                <p className="text-sm text-muted-foreground">{session.location}</p>
            </CardContent>
            {currentUser.role === Role.CLIENT && isFuture(parseISO(session.date)) && (
                <CardFooter>
                    {isAttending ? (
                        <button className="w-full bg-destructive/10 text-destructive font-semibold py-2 px-4 rounded-lg text-sm">Cancel Booking</button>
                    ) : isOnWaitlist ? (
                         <button className="w-full bg-amber-500/10 text-amber-600 font-semibold py-2 px-4 rounded-lg text-sm">Leave Waitlist</button>
                    ) : (
                        <button className="w-full bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm">
                            {session.attendees.length < session.capacity ? 'Book Spot' : 'Join Waitlist'}
                        </button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {label: string, children: React.ReactNode}> = ({label, children, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <select {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
            {children}
        </select>
    </div>
);

const FormButton: React.FC<{children: React.ReactNode, onClick: () => void, disabled?: boolean}> = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
    </button>
);


export const Schedule: React.FC<ScheduleProps> = ({ currentUser, sessions, clients = [], onAddNewSession }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SessionType>(SessionType.ONE_ON_ONE);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [location, setLocation] = useState('Video Call');
  const [capacity, setCapacity] = useState(10);
  const [attendee, setAttendee] = useState('');

  const mySessions = (currentUser.role === Role.TRAINER
    ? sessions
    : sessions.filter(s => s.attendees.includes(currentUser.id) || s.type === SessionType.CIRCUIT)
  ).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  const upcomingSessions = mySessions.filter(s => isFuture(parseISO(s.date)));
  const pastSessions = mySessions.filter(s => isPast(parseISO(s.date)));

  const groupedSessions = upcomingSessions.reduce((acc, session) => {
    const date = format(parseISO(session.date), 'EEEE, MMMM d');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const resetForm = () => {
    setTitle('');
    setType(SessionType.ONE_ON_ONE);
    setDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setLocation('Video Call');
    setCapacity(10);
    setAttendee('');
  }

  const handleCreateSession = () => {
    if (!title || !date) return;
    
    const sessionData: Omit<Session, 'id'> = {
        title,
        type,
        date: new Date(date).toISOString(),
        location,
        capacity: type === SessionType.CIRCUIT ? capacity : 1,
        attendees: type === SessionType.ONE_ON_ONE && attendee ? [attendee] : [],
        waitlist: []
    };
    
    onAddNewSession?.(sessionData);
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground">Your upcoming sessions and events.</p>
        </div>
        {currentUser.role === Role.TRAINER && (
             <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90">
                <PlusCircleIcon className="w-5 h-5"/>
                <span>New Session</span>
            </button>
        )}
      </div>
      
      {Object.keys(groupedSessions).length > 0 ? (
        Object.keys(groupedSessions).map((date) => (
            <div key={date}>
                <h2 className="font-semibold text-lg mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2">{date}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSessions[date].map(session => (
                        <SessionCard key={session.id} session={session} currentUser={currentUser} />
                    ))}
                </div>
            </div>
        ))
      ) : (
        <Card>
            <CardContent>
                <EmptyState
                    icon={<CalendarIcon />}
                    title="No Upcoming Sessions"
                    message="Your schedule is clear! Check back later for new events."
                />
            </CardContent>
        </Card>
      )}
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Session">
        <div className="space-y-4">
            <FormInput label="Title" type="text" placeholder="e.g., Full Body HIIT" value={title} onChange={e => setTitle(e.target.value)} />
            <FormSelect label="Type" value={type} onChange={e => setType(e.target.value as SessionType)}>
                <option value={SessionType.ONE_ON_ONE}>1:1 Session</option>
                <option value={SessionType.CIRCUIT}>Circuit / Group</option>
            </FormSelect>
            {type === SessionType.ONE_ON_ONE && (
                <FormSelect label="Client" value={attendee} onChange={e => setAttendee(e.target.value)}>
                    <option value="" disabled>Select a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </FormSelect>
            )}
             {type === SessionType.CIRCUIT && (
                <FormInput label="Capacity" type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))}/>
            )}
            <FormInput label="Date & Time" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            <FormInput label="Location" type="text" placeholder="e.g., Central Park" value={location} onChange={e => setLocation(e.target.value)} />
            <FormButton onClick={handleCreateSession} disabled={!title || !date || (type === SessionType.ONE_ON_ONE && !attendee)}>
                Create Session
            </FormButton>
        </div>
    </Modal>
    </>
  );
};