
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './common/Card';
import { UserIcon } from './Icons';

interface ProfilePageProps {
  currentUser: User;
  onUpdateProfile: (updatedUser: User) => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <input {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        <textarea {...props} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
    injuries: currentUser.injuries?.join(', ') || '',
    notes: currentUser.notes || '',
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData({
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        injuries: currentUser.injuries?.join(', ') || '',
        notes: currentUser.notes || '',
    });
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      ...formData,
      injuries: formData.injuries.split(',').map(s => s.trim()).filter(Boolean),
    };
    onUpdateProfile(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <UserIcon className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Update your personal information.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>This information will be visible to your coach.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <img src={formData.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
                    <div className="flex-1">
                        <FormInput 
                            label="Avatar URL"
                            id="avatar"
                            name="avatar"
                            type="text"
                            value={formData.avatar}
                            onChange={handleChange}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput 
                        label="Full Name"
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <FormInput 
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <FormTextarea 
                    label="Injuries or Health Conditions"
                    id="injuries"
                    name="injuries"
                    value={formData.injuries}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Left knee pain, shoulder impingement (separate with commas)"
                />
                <FormTextarea 
                    label="Notes for your Coach"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., I prefer morning workouts, my main goal is to build muscle..."
                />

                <div className="flex justify-end items-center space-x-4 pt-4">
                    {isSaved && <p className="text-sm text-green-600 font-medium">Changes saved!</p>}
                    <button type="submit" className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};
