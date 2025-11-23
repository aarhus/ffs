

import React, { useState } from 'react';
import { Announcement, Chat, Message, Role, User, ChatType } from '../types';
import { Card, CardContent } from './common/Card';
import { ChatView } from './ChatView';
import { format, parseISO } from 'date-fns';
import { PinIcon, PlusCircleIcon, UsersIcon } from './Icons';
import { users } from '../data/mockData';
import { NewAnnouncementModal } from './NewAnnouncementModal';

interface CircuitGroupProps {
  groupChat: Chat;
  currentUser: User;
  announcements: Announcement[];
  allMessages: Message[];
  onAddNewAnnouncement: (announcement: { title: string; body: string; pinned: boolean }) => void;
  onSendMessage: (chat: Chat, text: string) => void;
  onMarkChatAsRead: (chatId: string) => void;
}

type Tab = 'announcements' | 'chat' | 'members';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted'
    }`}
  >
    {label}
  </button>
);

export const CircuitGroup: React.FC<CircuitGroupProps> = ({ groupChat, currentUser, announcements, allMessages, onAddNewAnnouncement, onSendMessage, onMarkChatAsRead }) => {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  
  const sortedAnnouncements = [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  const members = users.filter(u => groupChat.participants.includes(u.id));
  const chatMessages = allMessages.filter(m => m.chatId === groupChat.id).sort((a,b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());

  const renderContent = () => {
    switch(activeTab) {
        case 'announcements':
            return (
                <div className="space-y-4">
                    {currentUser.role === Role.TRAINER && (
                         <button onClick={() => setIsAnnouncementModalOpen(true)} className="w-full flex items-center justify-center space-x-2 py-3 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                            <PlusCircleIcon className="w-5 h-5" />
                            <span className="font-semibold text-sm">Post New Announcement</span>
                         </button>
                    )}
                    {sortedAnnouncements.map(announcement => (
                        <Card key={announcement.id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-md mb-1">{announcement.title}</h3>
                                    {announcement.pinned && <PinIcon className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{announcement.body}</p>
                                <p className="text-xs text-muted-foreground/70">{format(parseISO(announcement.createdAt), 'MMM d, yyyy')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        case 'chat':
            return (
                <div className="h-full -m-6">
                     <ChatView 
                        chat={groupChat}
                        messages={chatMessages}
                        currentUser={currentUser}
                        onSendMessage={(text) => onSendMessage(groupChat, text)}
                        onMarkAsRead={() => onMarkChatAsRead(groupChat.id)}
                     />
                </div>
            );
        case 'members':
            return (
                <Card>
                    <CardContent>
                        <ul className="space-y-3">
                            {members.map(member => (
                                <li key={member.id} className="flex items-center space-x-3">
                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{member.role.toLowerCase()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            );
    }
  }

  return (
    <>
    <div className="p-4 md:p-6 h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">{groupChat.name}</h1>
        <div className="flex items-center space-x-2 text-muted-foreground mt-1">
            <UsersIcon className="w-4 h-4" />
            <span>{groupChat.participants.length} Members</span>
        </div>
      </header>
      <div className="flex space-x-2 border-b border-border mb-4">
        <TabButton label="Announcements" isActive={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} />
        <TabButton label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <TabButton label="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
    <NewAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} onPostAnnouncement={onAddNewAnnouncement} />
    </>
  );
};