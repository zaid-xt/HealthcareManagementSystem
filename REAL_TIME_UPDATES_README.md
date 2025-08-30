# Real-Time Updates for Healthcare Management System

## Overview
This system now includes real-time updates using WebSocket technology to automatically update dashboards and ward information across all connected clients.

## Features

### 🚀 Real-Time Ward Updates
- **Automatic Updates**: When wards are added, updated, or deleted, all connected dashboards update instantly
- **Live Connection Status**: Visual indicators show whether real-time updates are active
- **Fallback Refresh**: Automatic data refresh every 30 seconds if WebSocket connection fails

### 📱 Dashboard Integration
- **Patient Dashboard**: Shows real-time bed availability and ward information
- **Doctor Dashboard**: Displays current ward status and bed counts
- **Admin Dashboard**: Real-time ward management updates

### 🔔 Smart Notifications
- **Success Notifications**: When new wards are added
- **Info Notifications**: When wards are updated or deleted
- **Auto-dismiss**: Notifications automatically disappear after 4 seconds

## How It Works

### 1. WebSocket Connection
- Frontend connects to server via WebSocket on port 5000
- Connection status is displayed in the navbar and on relevant pages
- Green indicator = Live updates active
- Red indicator = Offline mode (fallback refresh active)

### 2. Real-Time Broadcasting
When ward operations occur:
- **Create**: New ward data is broadcast to all clients
- **Update**: Modified ward data is sent to all clients  
- **Delete**: Ward deletion is notified to all clients

### 3. Automatic UI Updates
- Dashboards automatically refresh ward statistics
- Ward lists update in real-time
- Bed availability counts update instantly
- No manual refresh required

## Technical Implementation

### Backend (Server.js)
```javascript
// WebSocket server setup
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" }
});

// Broadcast function
function broadcastWardUpdate(type, data) {
  io.emit('wardUpdate', { type, data });
}

// Used in ward endpoints
broadcastWardUpdate('created', newWard);
broadcastWardUpdate('updated', updatedWard);
broadcastWardUpdate('deleted', { id });
```

### Frontend
```typescript
// WebSocket context
const { socket, isConnected } = useWebSocket();

// Ward updates hook
const { isConnected } = useWardUpdates({
  onWardCreated: handleWardCreated,
  onWardUpdated: handleWardUpdated,
  onWardDeleted: handleWardDeleted
});
```

## Benefits

1. **Instant Updates**: No need to refresh pages manually
2. **Better User Experience**: Real-time information across all dashboards
3. **Improved Efficiency**: Staff can see changes immediately
4. **Reliable**: Fallback refresh ensures data stays current
5. **Scalable**: WebSocket handles multiple concurrent users

## Troubleshooting

### Connection Issues
- Check if server is running on port 5000
- Verify frontend is running on port 5173
- Check browser console for WebSocket errors

### Data Not Updating
- Verify WebSocket connection status (green indicator)
- Check if fallback refresh is working (red indicator)
- Ensure ward operations are completing successfully

### Performance
- WebSocket connections are lightweight
- Fallback refresh only runs when WebSocket is offline
- Notifications auto-dismiss to avoid clutter

## Future Enhancements

- [ ] Real-time patient admission updates
- [ ] Live appointment scheduling notifications
- [ ] Real-time lab result updates
- [ ] Live chat system for staff communication
- [ ] Push notifications for critical updates
