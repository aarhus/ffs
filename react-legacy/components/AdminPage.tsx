
import React, { useState } from 'react';
import { User, Role } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './common/Card';
import { PlusCircleIcon, ShieldIcon, UsersIcon } from './Icons';

interface AdminPageProps {
  allUsers: User[];
  onInviteClient: (email: string) => void;
  onPromoteUser: (userId: string) => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

const FormButton: React.FC<{children: React.ReactNode, onClick: () => void, disabled?: boolean}> = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
    </button>
);


export const AdminPage: React.FC<AdminPageProps> = ({ allUsers, onInviteClient, onPromoteUser }) => {
  const [newUserEmail, setNewUserEmail] = useState('');

  const handleInvite = () => {
    if (newUserEmail && newUserEmail.includes('@')) {
      onInviteClient(newUserEmail);
      setNewUserEmail('');
    } else {
      alert('Please enter a valid email address.');
    }
  };
  
  const trainers = allUsers.filter(u => u.role === Role.TRAINER);
  const clients = allUsers.filter(u => u.role === Role.CLIENT);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users and permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5" />
                <span>All Users ({allUsers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Trainers ({trainers.length})</h3>
                        <ul className="space-y-2">
                            {trainers.map(user => (
                                <li key={user.id} className="flex items-center space-x-3 p-2 bg-muted rounded-md">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-primary">Clients ({clients.length})</h3>
                        <ul className="space-y-2">
                             {clients.map(user => (
                                <li key={user.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full"/>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onPromoteUser(user.id)} className="flex items-center space-x-1 text-xs font-semibold text-primary hover:underline pr-2">
                                        <ShieldIcon className="w-4 h-4" />
                                        <span>Promote</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusCircleIcon className="w-5 h-5" />
                <span>Invite New Client</span>
              </CardTitle>
              <CardDescription>Enter an email to create a new client account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput 
                label="Client Email" 
                type="email" 
                placeholder="new.client@example.com" 
                value={newUserEmail} 
                onChange={(e) => setNewUserEmail(e.target.value)} 
              />
              <FormButton onClick={handleInvite} disabled={!newUserEmail}>
                Send Invite
              </FormButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};