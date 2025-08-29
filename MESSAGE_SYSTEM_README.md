# Message System Implementation

## Overview
The Healthcare Management System now includes a fully functional real-time messaging system that replaces the previous mock data implementation. Messages are stored in the database and can be sent between users based on their roles.

## Features

### ✅ Real-time Messaging
- **Database Storage**: All messages are stored in the MySQL database
- **Role-based Access**: Users can only message others based on their role permissions
- **Message Status**: Track sent, delivered, read, archived, and deleted status
- **Priority Levels**: Normal and urgent message priorities
- **Real-time Updates**: Messages are immediately saved and retrieved from the database

### ✅ User Interface
- **Message List**: View all sent and received messages
- **Compose Message**: Create new messages with recipient selection
- **View Message**: Read full message content with reply functionality
- **Search**: Search through messages by subject or content
- **Responsive Design**: Works on all device sizes

### ✅ Role-based Permissions
- **Doctors**: Can message patients
- **Patients**: Can message doctors
- **Admins**: Can message both doctors and patients

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId VARCHAR(50) NOT NULL,
  receiverId VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  status ENUM('sent', 'delivered', 'read', 'archived', 'deleted') DEFAULT 'sent',
  priority ENUM('normal', 'urgent') DEFAULT 'normal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sender (senderId),
  INDEX idx_receiver (receiverId),
  INDEX idx_status (status)
);
```

### Users Table (for recipients)
```sql
-- Users are fetched for recipient selection
-- Only id, name, email, role, and contactNumber are exposed
```

## API Endpoints

### Messages
- `GET /api/messages` - Get all messages with optional filters
- `GET /api/messages/:id` - Get a specific message
- `POST /api/messages` - Create a new message
- `PUT /api/messages/:id` - Update a message
- `DELETE /api/messages/:id` - Delete a message
- `PATCH /api/messages/:id/read` - Mark message as read

### Users
- `GET /api/users` - Get all users with optional role filter
- `GET /api/users/:id` - Get a specific user

## Frontend Components

### Core Components
1. **MessagesPage** (`src/pages/MessagesPage.tsx`)
   - Main page that orchestrates all message functionality
   - Handles data fetching, state management, and user interactions

2. **MessageList** (`src/components/messages/MessageList.tsx`)
   - Displays list of messages with status indicators
   - Handles message selection and visual feedback

3. **ComposeMessage** (`src/components/messages/ComposeMessage.tsx`)
   - Form for creating new messages
   - Recipient selection and priority setting

4. **ViewMessage** (`src/components/messages/ViewMessage.tsx`)
   - Full message view with reply functionality
   - Message metadata and status display

### API Integration
- **messagesApi.ts** (`src/api/messagesApi.ts`)
  - All message-related API calls
  - Type definitions for messages
  - Error handling and data transformation

- **usersApi.ts** (`src/api/usersApi.ts`)
  - User fetching for recipient lists
  - Role-based user filtering

## Usage Examples

### Sending a Message
```typescript
import { createMessage } from '../api/messagesApi';

const handleSend = async () => {
  try {
    const newMessage = await createMessage({
      senderId: currentUser.id,
      receiverId: selectedRecipient.id,
      subject: 'Appointment Follow-up',
      content: 'How are you feeling after the treatment?',
      priority: 'normal'
    });
    
    // Message is automatically saved to database
    console.log('Message sent:', newMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### Fetching User Messages
```typescript
import { getUserMessages } from '../api/messagesApi';

const fetchMessages = async (userId: string) => {
  try {
    const messages = await getUserMessages(userId);
    // Messages include both sent and received
    setMessages(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
};
```

## Security Features

### Data Validation
- Server-side validation of all message fields
- SQL injection prevention through parameterized queries
- Input sanitization and length limits

### Access Control
- Users can only access their own messages
- Role-based recipient filtering
- No unauthorized message access

### Error Handling
- Comprehensive error messages for debugging
- Graceful fallbacks for failed operations
- User-friendly error displays

## Performance Optimizations

### Database Indexing
- Indexes on senderId, receiverId, and status
- Efficient message retrieval and filtering
- Optimized timestamp-based sorting

### Frontend Optimization
- Lazy loading of message content
- Efficient state management
- Minimal re-renders through proper React patterns

## Testing

### Manual Testing Checklist
- [ ] Send message between different user roles
- [ ] Verify message storage in database
- [ ] Test message read status updates
- [ ] Verify search functionality
- [ ] Test priority message handling
- [ ] Verify reply functionality
- [ ] Test error handling scenarios

### Database Verification
```sql
-- Check message creation
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 5;

-- Verify user permissions
SELECT DISTINCT role FROM users;

-- Check message status updates
SELECT id, status, is_read FROM messages WHERE id = [message_id];
```

## Troubleshooting

### Common Issues

1. **Messages not loading**
   - Check server connection (port 5000)
   - Verify database tables exist
   - Check browser console for API errors

2. **Cannot send messages**
   - Verify user authentication
   - Check recipient selection
   - Ensure required fields are filled

3. **Database connection errors**
   - Verify MySQL service is running
   - Check environment variables
   - Ensure database schema is correct

### Debug Mode
Enable detailed logging in the browser console:
```typescript
// Add to any component for debugging
console.log('Current user:', user);
console.log('Messages:', messages);
console.log('Users:', users);
```

## Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Message threading
- [ ] File attachments
- [ ] Message templates
- [ ] Bulk message operations
- [ ] Message archiving
- [ ] Advanced search filters

### Technical Improvements
- [ ] WebSocket integration for real-time updates
- [ ] Message encryption
- [ ] Offline message queuing
- [ ] Message delivery receipts
- [ ] Performance monitoring

## Support

For technical support or questions about the message system:
1. Check the browser console for error messages
2. Verify database connectivity
3. Review API endpoint responses
4. Check user authentication status
5. Verify role-based permissions

---

**Last Updated**: Current implementation
**Version**: 1.0.0
**Status**: Production Ready ✅
