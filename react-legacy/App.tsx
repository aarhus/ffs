

import React, { useState, useEffect } from 'react';
import { Role, Screen, User, ChatType, Goal, Workout, Measurement, NutritionLog, Exercise, Session, Announcement, GoalStatus, Chat, Message } from './types';
import { 
    users as initialUsers, 
    sessions as initialSessions, 
    goals as initialGoals, 
    habits as initialHabits, 
    chats as initialChats, 
    workouts as initialWorkouts, 
    announcements as initialAnnouncements, 
    nutritionLogs as initialNutritionLogs, 
    measurements as initialMeasurements,
    messages as initialMessages
} from './data/mockData';
import { ClientHome } from './components/ClientHome';
import { TrainerDashboard } from './components/TrainerDashboard';
import { ChatView } from './components/ChatView';
import {
  AppleIcon,
  CalendarIcon,
  ChevronsLeftIcon,
  ClipboardListIcon,
  DumbbellIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
  TargetIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from './components/Icons';
import { TrainingLog } from './components/TrainingLog';
import { NutritionLog as NutritionLogPage } from './components/NutritionLog';
import { Goals } from './components/Goals';
import { Schedule } from './components/Schedule';
import { Progress } from './components/Progress';
import { CircuitGroup } from './components/CircuitGroup';
import { format, parseISO } from 'date-fns';
import { AddWorkout } from './components/AddWorkout';
import { TrainerMessages } from './components/TrainerMessages';
import { TrainerClientLogs } from './components/TrainerClientLogs';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';
import { ProfilePage } from './components/ProfilePage';
import { EmptyState } from './components/common/EmptyState';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    } ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
  >
    {icon}
    <span className={`${isCollapsed ? 'sr-only' : 'inline'}`}>{label}</span>
  </button>
);

const SidebarContent: React.FC<{
    isCollapsed: boolean;
    navItems: { id: string; label: string; icon: React.ReactNode; }[];
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    currentUser: User;
    logout: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}> = ({ isCollapsed, navItems, activeScreen, setActiveScreen, currentUser, logout, isDarkMode, toggleTheme }) => (
    <>
        <div className={`flex items-center space-x-2 mb-8 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
            <DumbbellIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <span className={`text-xl font-bold ${isCollapsed ? 'hidden' : ''}`}>Fitcoach AI</span>
        </div>
        <nav className="flex-1 space-y-2 px-2">
            {navItems.map((item) => (
                <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeScreen === item.id}
                    isCollapsed={isCollapsed}
                    onClick={() => setActiveScreen(item.id as Screen)}
                />
            ))}
        </nav>
        <div className="mt-auto space-y-2 p-2 border-t border-border">
             <div className={`flex items-center p-2 rounded-lg`}>
                <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className={`ml-3 overflow-hidden ${isCollapsed ? 'hidden' : ''}`}>
                    <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role.toLowerCase()}</p>
                </div>
            </div>
            <NavItem icon={<LogOutIcon className="w-5 h-5"/>} label="Logout" isCollapsed={isCollapsed} isActive={false} onClick={logout}/>
            
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} pt-2`}>
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted">
                {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
              </button>
            </div>
        </div>
    </>
);


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- State Management for all App Data ---
  const [users, setUsers] = useState(initialUsers);
  const [sessions, setSessions] = useState(initialSessions);
  const [goals, setGoals] = useState(initialGoals);
  const [habits, setHabits] = useState(initialHabits);
  const [chats, setChats] = useState(initialChats);
  const [messages, setMessages] = useState(initialMessages);
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [nutritionLogs, setNutritionLogs] = useState(initialNutritionLogs);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSetScreen = (screen: Screen) => {
    setActiveScreen(screen);
    setIsMobileMenuOpen(false);
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveScreen(user.role === Role.TRAINER ? 'dashboard' : 'home');
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }

  const goToAddWorkout = () => {
    setPreviousScreen(activeScreen);
    setActiveScreen('addWorkout');
  }
  
  // --- Data Handler Functions ---
  const handleSendMessage = (chat: Chat, text: string) => {
      if (!currentUser || !text.trim()) return;

      const chatExists = chats.some(c => c.id === chat.id);
      if (!chatExists) {
          setChats(prev => [...prev, chat]);
      }

      const newMessage: Message = {
          id: `msg_${Date.now()}`,
          chatId: chat.id,
          senderId: currentUser.id,
          text,
          createdAt: new Date().toISOString(),
          readBy: [currentUser.id],
      };
      setMessages(prev => [...prev, newMessage]);

      setChats(prev => prev.map(c => {
          if (c.id === chat.id) {
              const updatedUnreadCount = { ...c.unreadCount };
              const otherParticipantId = c.participants.find(p => p !== currentUser.id);
              if (otherParticipantId) {
                  updatedUnreadCount[otherParticipantId] = (updatedUnreadCount[otherParticipantId] || 0) + 1;
              }
              return { 
                  ...c, 
                  lastMessage: text, 
                  lastMessageTimestamp: newMessage.createdAt,
                  unreadCount: updatedUnreadCount
              };
          }
          return c;
      }));
  };

  const handleMarkChatAsRead = (chatId: string) => {
      if (!currentUser) return;
      setChats(prev => prev.map(c => {
          if (c.id === chatId) {
              const updatedUnreadCount = { ...c.unreadCount };
              updatedUnreadCount[currentUser.id] = 0;
              return { ...c, unreadCount: updatedUnreadCount };
          }
          return c;
      }));
  };

  const handleAddMeasurement = (newMeasurement: Omit<Measurement, 'id' | 'userId' | 'date'>) => {
    if (!currentUser) return;
    setMeasurements(prev => [
      ...prev,
      { id: `m_${Date.now()}`, userId: currentUser.id, date: new Date().toISOString(), ...newMeasurement }
    ]);
  };

  const handleUpdateGoal = (goalId: string, newCurrent: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: newCurrent } : g));
  };
  
  const handleAddWorkout = (newWorkoutData: { notes?: string; perceivedExertion: number; exercises: Exercise[] }) => {
    if (!currentUser) return;

    // Get previous workouts for this user to calculate PRs
    const userWorkouts = workouts.filter(w => w.userId === currentUser.id);

    const processedExercises = newWorkoutData.exercises.map(newExercise => {
        let isNewPR = false;
        const exerciseName = newExercise.name.toLowerCase();
        const newWeight = newExercise.weight || 0;
        
        // Handle rep ranges like "8-12" by taking the first number
        const newReps = parseInt(String(newExercise.reps).split(/[- ]/)[0], 10);
        
        // If reps are not a valid number, we can't determine a PR
        if (isNaN(newReps)) {
            return { ...newExercise, isPR: false };
        }

        // Find all past performances of the same exercise
        const pastPerformances = userWorkouts
            .flatMap(w => w.exercises)
            .filter(e => e.name.toLowerCase() === exerciseName);

        if (pastPerformances.length === 0) {
            // First time doing this exercise is a PR if there's weight or reps
            if (newWeight > 0 || newReps > 0) {
                isNewPR = true;
            }
        } else {
            // Find the best past performance
            let maxWeight = -1;
            let repsAtMaxWeight = 0;
            
            pastPerformances.forEach(pastPerf => {
                const pastWeight = pastPerf.weight || 0;
                const pastReps = parseInt(String(pastPerf.reps).split(/[- ]/)[0], 10);

                if (isNaN(pastReps)) return;

                if (pastWeight > maxWeight) {
                    maxWeight = pastWeight;
                    repsAtMaxWeight = pastReps;
                } else if (pastWeight === maxWeight && pastReps > repsAtMaxWeight) {
                    repsAtMaxWeight = pastReps;
                }
            });

            // Check if the new performance is a PR
            if (newWeight > maxWeight) {
                isNewPR = true;
            } else if (newWeight === maxWeight && newReps > repsAtMaxWeight) {
                isNewPR = true;
            }
        }

        return {
            ...newExercise,
            isPR: isNewPR,
        };
    });

    const newWorkout: Workout = {
        id: `w_${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toISOString(),
        completed: true,
        notes: newWorkoutData.notes,
        perceivedExertion: newWorkoutData.perceivedExertion,
        exercises: processedExercises, // Use the exercises with the new PR flags
    };

    setWorkouts(prev => [newWorkout, ...prev]);
  };

  const handleAddNewSession = (sessionData: Omit<Session, 'id'>) => {
    const newSession: Session = {
        id: `s_${Date.now()}`,
        ...sessionData
    };
    setSessions(prev => [...prev, newSession]);
  };

  const handleInviteClient = (email: string) => {
    const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUser: User = {
        id: `user_client_${Date.now()}`,
        role: Role.CLIENT,
        name: name,
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        password: 'password123', // Default password for new clients
    };
    setUsers(prev => [...prev, newUser]);
    alert(`Client account created for ${name}! Default password is "password123".`);
  };

  const handlePromoteUser = (userId: string) => {
     setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: Role.TRAINER } : u));
     alert(`${users.find(u=>u.id === userId)?.name} has been promoted to Trainer.`);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleAddNutritionLog = (log: { type: 'meal' | 'snack' | 'water'; description?: string; protein?: number; waterAmount?: number }) => {
    if (!currentUser) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingLogIndex = nutritionLogs.findIndex(nl => nl.userId === currentUser.id && nl.date.startsWith(todayStr));

    if (existingLogIndex > -1) {
        const updatedLogs = [...nutritionLogs];
        const existingLog = updatedLogs[existingLogIndex];
        if (log.type === 'meal' || log.type === 'snack') {
            existingLog.meals.push({ text: `${log.type.charAt(0).toUpperCase() + log.type.slice(1)}: ${log.description}` });
            if (log.protein) existingLog.protein += log.protein;
        }
        if (log.type === 'water' && log.waterAmount) {
            existingLog.water += log.waterAmount;
        }
        setNutritionLogs(updatedLogs);
    } else {
        const newLog: NutritionLog = {
            id: `n_${Date.now()}`,
            userId: currentUser.id,
            date: new Date().toISOString(),
            meals: (log.type === 'meal' || log.type === 'snack') ? [{ text: `${log.type.charAt(0).toUpperCase() + log.type.slice(1)}: ${log.description}` }] : [],
            protein: log.protein || 0,
            fibre: 0, // Not tracked in new modal
            water: log.waterAmount || 0,
        };
        setNutritionLogs(prev => [newLog, ...prev]);
    }
  };

  const handleAddNewGoal = (goalData: Omit<Goal, 'id' | 'userId' | 'current' | 'status'>) => {
    if (!currentUser) return;
    const newGoal: Goal = {
        id: `g_${Date.now()}`,
        userId: currentUser.id,
        current: 0,
        status: GoalStatus.ACTIVE,
        ...goalData,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleBulkUpdateGoals = (updates: { goalId: string; newCurrent: number }[]) => {
      setGoals(prevGoals => {
          const newGoals = [...prevGoals];
          updates.forEach(update => {
              const goalIndex = newGoals.findIndex(g => g.id === update.goalId);
              if (goalIndex !== -1) {
                  newGoals[goalIndex].current = update.newCurrent;
              }
          });
          return newGoals;
      });
  };

  const handleAddNewAnnouncement = (announcementData: { title: string; body: string; pinned: boolean }) => {
      const newAnnouncement: Announcement = {
          id: `ann_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...announcementData,
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
  };


  const clientNavItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'coaching', label: '1:1 Coaching', icon: <MessageSquareIcon className="w-5 h-5" /> },
    { id: 'circuit', label: 'Circuit Group', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'training', label: 'Training', icon: <DumbbellIcon className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <AppleIcon className="w-5 h-5" /> },
    { id: 'goals', label: 'Goals', icon: <TargetIcon className="w-5 h-5" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUpIcon className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];
  
  const trainerNavItems = [
     { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon className="w-5 h-5" /> },
     { id: 'coaching', label: 'Messages', icon: <MessageSquareIcon className="w-5 h-5" /> },
     { id: 'training', label: 'Client Logs', icon: <ClipboardListIcon className="w-5 h-5" /> },
     { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
     { id: 'admin', label: 'Admin', icon: <ShieldIcon className="w-5 h-5" /> },
  ];

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} allUsers={users} />
  }

  const isClientView = currentUser.role === Role.CLIENT;
  const navItems = isClientView ? clientNavItems : trainerNavItems;

  const renderContent = () => {
    if (isClientView) {
        const groupChat = chats.find(c => c.type === ChatType.GROUP && c.participants.includes(currentUser.id));

      switch (activeScreen) {
        case 'home':
          return <ClientHome 
                    currentUser={currentUser} 
                    sessions={sessions} 
                    goals={goals} 
                    habits={habits}
                    workouts={workouts}
                    measurements={measurements}
                    onAddMeasurement={handleAddMeasurement}
                    onUpdateGoal={handleUpdateGoal}
                    onAddNutritionLog={handleAddNutritionLog}
                    onGoToAddWorkout={goToAddWorkout}
                 />;
        case 'coaching': {
            const trainer = users.find(u => u.role === Role.TRAINER);
            if (!trainer) {
                return <EmptyState icon={<MessageSquareIcon />} title="No Coach Available" message="There is no coach assigned to you to start a conversation." />;
            }

            const chatToRender = chats.find(c => c.type === ChatType.DM && c.participants.includes(currentUser.id) && c.participants.includes(trainer.id)) 
                || {
                    id: `chat_${currentUser.id}_${trainer.id}`,
                    type: ChatType.DM,
                    participants: [currentUser.id, trainer.id],
                    lastMessage: "Start the conversation!",
                    lastMessageTimestamp: new Date().toISOString(),
                    unreadCount: { [currentUser.id]: 0, [trainer.id]: 0 },
                };

            const chatMessages = messages.filter(m => m.chatId === chatToRender.id).sort((a,b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());

            return <ChatView 
                chat={chatToRender}
                messages={chatMessages} 
                currentUser={currentUser} 
                onSendMessage={(text) => handleSendMessage(chatToRender, text)}
                onMarkAsRead={() => handleMarkChatAsRead(chatToRender.id)}
            />;
        }
        case 'circuit':
            return groupChat ? <CircuitGroup 
                groupChat={groupChat} 
                currentUser={currentUser} 
                announcements={announcements} 
                onAddNewAnnouncement={handleAddNewAnnouncement}
                allMessages={messages}
                onSendMessage={handleSendMessage}
                onMarkChatAsRead={handleMarkChatAsRead}
             /> : <EmptyState icon={<UsersIcon />} title="Not in a Group" message="You are not part of any group circuits yet." />;
        case 'training':
            return <TrainingLog currentUser={currentUser} workouts={workouts} onStartWorkout={goToAddWorkout} />;
        case 'nutrition':
            return <NutritionLogPage currentUser={currentUser} logs={nutritionLogs} habits={habits} onAddNutritionLog={handleAddNutritionLog}/>;
        case 'goals':
            return <Goals currentUser={currentUser} goals={goals} onAddNewGoal={handleAddNewGoal} onBulkUpdateGoals={handleBulkUpdateGoals} />;
        case 'schedule':
            return <Schedule currentUser={currentUser} sessions={sessions} />;
        case 'progress':
            return <Progress 
                        currentUser={currentUser} 
                        measurements={measurements} 
                        workouts={workouts} 
                        habits={habits} 
                        onAddMeasurement={handleAddMeasurement}
                    />;
        case 'addWorkout':
            return <AddWorkout 
                        onAddWorkout={(workoutData) => {
                            handleAddWorkout(workoutData);
                            handleSetScreen(previousScreen === 'addWorkout' ? 'training' : previousScreen);
                        }}
                        onBack={() => handleSetScreen(previousScreen === 'addWorkout' ? 'training' : previousScreen)}
                    />;
        case 'profile':
            return <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
        default:
          return <div className="p-6"><h2 className="text-xl font-semibold">Coming Soon</h2><p className="text-muted-foreground">{activeScreen} page is under construction.</p></div>;
      }
    } else { // Trainer View
      const trainerClients = users.filter(u => u.role === Role.CLIENT);
      switch (activeScreen) {
        case 'dashboard':
          return <TrainerDashboard currentUser={currentUser} sessions={sessions} chats={chats} workouts={workouts} />;
        case 'coaching': {
            const trainerChats = chats.filter(c => c.participants.includes(currentUser.id)).sort((a,b) => parseISO(b.lastMessageTimestamp).getTime() - parseISO(a.lastMessageTimestamp).getTime());
            return <TrainerMessages 
                currentUser={currentUser} 
                chats={trainerChats} 
                allMessages={messages}
                onSendMessage={handleSendMessage}
                onMarkChatAsRead={handleMarkChatAsRead}
            />;
        }
        case 'training':
            return <TrainerClientLogs currentUser={currentUser} workouts={workouts} clients={trainerClients} />;
        case 'schedule':
            return <Schedule 
                        currentUser={currentUser} 
                        sessions={sessions} 
                        clients={trainerClients}
                        onAddNewSession={handleAddNewSession}
                    />;
        case 'admin':
            return <AdminPage allUsers={users} onInviteClient={handleInviteClient} onPromoteUser={handlePromoteUser} />;
        default:
           return <div className="p-6"><h2 className="text-xl font-semibold">Coming Soon</h2><p className="text-muted-foreground">{activeScreen} page is under construction.</p></div>;
      }
    }
  };

  const sidebarProps = {
    navItems, activeScreen, setActiveScreen: handleSetScreen, currentUser, logout: handleLogout, isDarkMode, toggleTheme,
  };

  return (
    <div className="min-h-screen font-sans text-foreground">
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex-col flex p-2 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent isCollapsed={false} {...sidebarProps} />
      </aside>
      {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-border bg-card p-2 transition-[width] duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent isCollapsed={isSidebarCollapsed} {...sidebarProps} />
        <div className="mt-2 border-t border-border pt-2">
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-full flex items-center space-x-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground justify-center px-2"
            >
                <ChevronsLeftIcon className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                <span className={`${isSidebarCollapsed ? 'sr-only' : 'inline'}`}>Collapse</span>
            </button>
        </div>
      </aside>

      <div className={`flex flex-col min-h-screen transition-[padding-left] duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-muted-foreground">
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
                <DumbbellIcon className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold">Fitcoach AI</span>
            </div>
             <div className="w-6"></div> {/* Spacer */}
        </header>

        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;