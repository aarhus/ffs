

import React, { useState } from 'react';
import { Chat, User, Role, Message } from '../types';
import { ChatView } from './ChatView';
import { users as allUsers } from '../data/mockData';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface TrainerMessagesProps {
  currentUser: User;
  chats: Chat[];
  allMessages: Message[];
  onSendMessage: (chat: Chat, text: string) => void;
  onMarkChatAsRead: (chatId: string) => void;
}

export const TrainerMessages: React.FC<TrainerMessagesProps> = ({ currentUser, chats, allMessages, onSendMessage, onMarkChatAsRead }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);

  const getChatPartner = (chat: Chat) => {
    if (chat.type === 'GROUP') return { name: chat.name, avatar: 'https://i.pravatar.cc/150?u=group_chat' };
    const partnerId = chat.participants.find(p => p !== currentUser.id);
    return allUsers.find(u => u.id === partnerId);
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    onMarkChatAsRead(chat.id);
  }
  
  return (
    <div className="flex h-full bg-card">
      <aside className="w-full md:w-1/3 xl:w-1/4 border-r border-border flex flex-col">
        <header className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
          {/* A search bar could be added here in the future */}
        </header>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {chats.map(chat => {
                const partner = getChatPartner(chat);
                if (!partner) return null;
                const unreadCount = chat.unreadCount[currentUser.id] || 0;
                const isActive = selectedChat?.id === chat.id;

                return (
                    <li key={chat.id}>
                        <button onClick={() => handleSelectChat(chat)} className={`w-full text-left p-3 flex items-center space-x-3 transition-colors ${isActive ? 'bg-muted dark:bg-muted' : 'hover:bg-muted/50 dark:hover:bg-muted/50'}`}>
                            <img src={partner.avatar} alt={partner.name} className="w-12 h-12 rounded-full" />
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{partner.name}</p>
                                    <p className="text-xs text-muted-foreground flex-shrink-0">{formatDistanceToNow(parseISO(chat.lastMessageTimestamp), { addSuffix: true })}</p>
                                </div>
                                <div className="flex justify-between items-start mt-1">
                                    <p className="text-xs text-muted-foreground truncate pr-2">{chat.lastMessage}</p>
                                    {unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    </li>
                )
            })}
          </ul>
        </nav>
      </aside>
      <main className="hidden md:flex flex-1">
         {selectedChat ? (
          <ChatView 
            chat={selectedChat} 
            messages={allMessages.filter(m => m.chatId === selectedChat.id).sort((a,b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime())}
            currentUser={currentUser}
            onSendMessage={(text) => onSendMessage(selectedChat, text)}
            onMarkAsRead={() => onMarkChatAsRead(selectedChat.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-muted-foreground">Select a conversation to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  )
}