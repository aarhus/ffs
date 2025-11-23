

import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Chat } from '../types';
import { users } from '../data/mockData';
import { format, parseISO } from 'date-fns';
import { PaperclipIcon, SendIcon, PinIcon } from './Icons';

interface ChatViewProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onMarkAsRead: () => void;
}

const MessageBubble: React.FC<{ message: Message; isOwnMessage: boolean; sender?: User }> = ({ message, isOwnMessage, sender }) => {
  return (
    <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full" />
      )}
      <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-muted dark:bg-muted text-foreground rounded-bl-lg'}`}>
        {!isOwnMessage && <p className="text-xs font-bold text-primary dark:text-primary-dark mb-1">{sender?.name}</p>}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className="text-xs opacity-70 mt-1 text-right">{format(parseISO(message.createdAt), 'p')}</p>
      </div>
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({ chat, messages, currentUser, onSendMessage, onMarkAsRead }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const pinnedMessages = messages.filter(m => m.pinned);
  const regularMessages = messages.filter(m => !m.pinned);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    onMarkAsRead();
  }, [chat.id, onMarkAsRead]);

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const getChatTitle = () => {
    if (chat.name) return chat.name;
    const otherParticipantId = chat.participants.find(p => p !== currentUser.id);
    const otherParticipant = users.find(u => u.id === otherParticipantId);
    return otherParticipant?.name || 'Chat';
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <header className="p-4 border-b border-border flex items-center">
        <h2 className="text-lg font-semibold">{getChatTitle()}</h2>
      </header>
      <main className="flex-1 overflow-y-auto">
        {pinnedMessages.length > 0 && (
            <div className="p-4 sticky top-0 bg-card/80 backdrop-blur-sm">
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800 rounded-lg p-3">
                    {pinnedMessages.map(message => (
                        <div key={message.id} className="flex items-start space-x-2 text-amber-800 dark:text-amber-200">
                             <PinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                             <p className="text-sm">{message.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        <div className="p-4 space-y-4">
            {regularMessages.map(message => {
            const sender = users.find(u => u.id === message.senderId);
            return (
                <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUser.id}
                sender={sender}
                />
            );
            })}
            <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="p-2 text-muted-foreground hover:text-primary">
            <PaperclipIcon className="w-5 h-5"/>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted border-input rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50" disabled={!newMessage.trim()}>
            <SendIcon className="w-5 h-5"/>
          </button>
        </form>
      </footer>
    </div>
  );
};