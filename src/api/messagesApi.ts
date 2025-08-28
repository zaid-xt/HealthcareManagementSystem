const API_URL = 'http://localhost:5000/api/messages';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  status: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted';
  priority: 'normal' | 'urgent';
}

export interface CreateMessageData {
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  priority?: 'normal' | 'urgent';
}

export interface UpdateMessageData {
  subject?: string;
  content?: string;
  status?: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted';
  priority?: 'normal' | 'urgent';
  is_read?: boolean;
}

// Get all messages with optional filters
export const getMessages = async (filters?: {
  senderId?: string;
  receiverId?: string;
  status?: string;
  priority?: string;
}): Promise<Message[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.senderId) queryParams.append('senderId', filters.senderId);
    if (filters?.receiverId) queryParams.append('receiverId', filters.receiverId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get a single message by ID
export const getMessage = async (id: string): Promise<Message> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch message: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

// Create a new message
export const createMessage = async (messageData: CreateMessageData): Promise<Message> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

// Update an existing message
export const updateMessage = async (id: string, messageData: UpdateMessageData): Promise<Message> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update message: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Get messages for a specific user (either as sender or receiver)
export const getUserMessages = async (userId: string): Promise<Message[]> => {
  try {
    // First, try to get ALL messages to see what's in the database
    const allMessagesResponse = await fetch(API_URL);
    if (!allMessagesResponse.ok) {
      throw new Error(`Failed to fetch all messages: ${allMessagesResponse.statusText}`);
    }
    
    const allMessages = await allMessagesResponse.json();
    
    // Filter messages for the current user
    const userMessages = allMessages.filter((message: Message) => {
      const isSender = message.senderId == userId; // Use == for type coercion
      const isReceiver = message.receiverId == userId; // Use == for type coercion
      const isForUser = isSender || isReceiver;
      
      return isForUser;
    });
    
    // Sort by timestamp (newest first)
    return userMessages.sort((a: Message, b: Message) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  } catch (error) {
    throw error;
  }
};
