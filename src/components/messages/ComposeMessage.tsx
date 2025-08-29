import React, { useState } from 'react';
import { Send, X, Paperclip } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { User } from '../../api/usersApi';

interface ComposeMessageProps {
  recipients: User[];
  onSend: (subject: string, content: string, recipientId: string, priority?: 'normal' | 'urgent') => void;
  onCancel: () => void;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  recipients,
  onSend,
  onCancel
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && content && recipientId) {
      onSend(subject, content, recipientId, priority);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To:
        </label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select recipient</option>
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name} ({recipient.role})
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority:
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          leftIcon={<Paperclip className="h-4 w-4" />}
        >
          Attach File
        </Button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          leftIcon={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Send className="h-4 w-4" />}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
};

export default ComposeMessage;