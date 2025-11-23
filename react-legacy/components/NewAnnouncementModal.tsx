
import React, { useState } from 'react';
import { Modal } from './common/Modal';

interface NewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAnnouncement: (announcement: { title: string; body: string; pinned: boolean }) => void;
}

export const NewAnnouncementModal: React.FC<NewAnnouncementModalProps> = ({ isOpen, onClose, onPostAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);

  const handleSubmit = () => {
    if (!title || !body) return;
    onPostAnnouncement({ title, body, pinned });
    onClose();
    setTitle('');
    setBody('');
    setPinned(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Important Update!" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Write your announcement here..."></textarea>
        </div>
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isPinned" checked={pinned} onChange={e => setPinned(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
            <label htmlFor="isPinned" className="text-sm font-medium text-muted-foreground">Pin this announcement</label>
        </div>
        <button onClick={handleSubmit} disabled={!title || !body} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
          Post Announcement
        </button>
      </div>
    </Modal>
  );
};
