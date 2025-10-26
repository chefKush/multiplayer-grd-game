# Multiplayer Grid Game - Evivve Assignment

A real-time multiplayer web application where players can collaboratively update a 10x10 grid with Unicode characters.

**Submitted by:** Kushal M S  
**LinkedIn:** [https://www.linkedin.com/in/kushal-m-s-770016268/](https://www.linkedin.com/in/kushal-m-s-770016268/)  
**Email:** kushalms001@gmail.com

---

## 🎯 Assignment Requirements Completed

### Core Requirements ✅

- **10x10 Grid**: Fully functional grid with 100 cells
- **Unicode Character Selection**: Players can input any Unicode character (emojis, symbols, letters)
- **One-Time Update Restriction**: Implemented with 1-minute cooldown timer
- **Real-time Updates**: All connected players see updates instantly via WebSockets
- **Online Players Count**: Live counter showing number of connected players
- **Shared Grid State**: All players interact with the same grid

### Extra Features Implemented ✅

- **Timed Restriction (1 minute)**: After submitting, players wait 60 seconds before next update
- **Historical Updates**: Complete history viewer with:
  - Timeline of all updates
  - Grouped updates by second
  - View grid state at any point in time
  - Statistics dashboard
- **Visual Design**: Modern, polished UI matching reference with animations
- **Player Identification**: Color-coded cells (green for own cells, blue for others)
- **Error Handling**: Comprehensive validation and user feedback
- **Responsive Design**: Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.IO** for WebSocket connections
- **CORS** enabled for cross-origin requests

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd multiplayer-grid-game
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# OR for production build
npm run build
npm start
```

### 3. Frontend Setup

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# OR for production build
npm run build
npm run preview
```

---

## 🎮 How to Use

### For Players:

1. **Join the Game**: Enter your name on the landing page
2. **Select a Cell**: Click any cell in the 10x10 grid
3. **Enter Character**: Type any Unicode character (😊, ♥, 🎮, etc.)
4. **Submit**: Click "Submit" to update the grid
5. **Wait for Cooldown**: You must wait 60 seconds before your next update
6. **View History**: Click "View History" to see all past updates

### For Testing Multiple Players:

- Open the application in multiple browser windows/tabs
- Or open in different browsers
- Or use incognito/private mode
- Each instance represents a different player

---

## 🔧 Technical Implementation Details

### Real-time Communication

- Uses Socket.IO for bidirectional event-based communication
- Events handled:
  - `join`: Player connects and receives initial state
  - `update-cell`: Player updates a cell
  - `cell-updated`: Broadcast to all players
  - `players-count`: Real-time player count updates
  - `cooldown-started`: Timer starts after update
  - `get-history`: Request historical data
  - `error`: Validation and error messages

### State Management

- **Backend**: In-memory storage (can be upgraded to MongoDB)
- **Frontend**: React hooks (useState, useEffect)
- **Grid State**: 2D array synchronized across all clients

### Cooldown Logic

- Server-side validation prevents cheating
- Client-side timer for UX
- Timestamp-based calculation
- Graceful handling of page refresh

### History Feature

- All updates stored with timestamp
- Grouped by second for better UX
- Time-travel functionality to view past states
- Statistics dashboard

---

## 🎨 Design Decisions

### UI/UX Choices:

1. **Color Coding**: Visual distinction between own cells (green) and others (blue)
2. **Gradient Background**: Modern, eye-catching design
3. **Animations**: Smooth transitions and hover effects
4. **Real-time Feedback**: Immediate error messages and cooldown timer
5. **Responsive Grid**: Adapts to different screen sizes

### Technical Choices:

1. **TypeScript**: Type safety reduces bugs
2. **Vite**: Fast development experience
3. **Socket.IO**: Reliable real-time communication
4. **Tailwind CSS**: Rapid UI development
5. **Component Architecture**: Reusable, maintainable code

---

## 🤖 AI Tool Usage Disclosure

As required, here is a complete disclosure of AI tools used in this project:

### Tools Used:

1. **Claude AI (Anthropic)** - Used for:
   - Initial project structure planning
   - Code architecture suggestions
   - TypeScript type definitions
   - Component design patterns
   - README documentation structure
   - Debugging assistance

### What Was AI-Generated:

- Project boilerplate and structure
- Component templates (Grid, PlayerInfo, HistoryViewer)
- Socket.IO event handler patterns
- TypeScript interfaces
- This README documentation

### What Was Manually Created:

- Business logic implementation
- Cooldown mechanism
- History grouping algorithm
- UI/UX design decisions
- Styling and animations
- Error handling specifics
- Testing and bug fixes

### Why AI Was Used:

- Speed up initial setup
- Ensure best practices
- TypeScript type safety
- Comprehensive documentation
- Reduce boilerplate code

**Note:** All AI-generated code was reviewed, tested, modified, and validated to ensure it meets the requirements and works correctly.

---

## 📊 Performance Considerations

- **In-memory Storage**: Fast but resets on server restart (can upgrade to database)
- **Socket.IO**: Efficient for real-time updates with automatic reconnection
- **Grid Rendering**: Optimized with React keys and minimal re-renders
- **History Storage**: Unlimited growth (consider pagination for production)

---

## 🐛 Known Limitations

1. **State Persistence**: Grid resets when server restarts (by design for this assignment)
2. **No Authentication**: Players can choose any name
3. **History Size**: Unlimited growth (would need cleanup in production)
4. **Single Server**: No horizontal scaling yet

---

## 📞 Contact

**Kushal M S**

- LinkedIn: [https://www.linkedin.com/in/kushal-m-s-770016268/](https://www.linkedin.com/in/kushal-m-s-770016268/)
- Email: kushalms001@gmail.com
- Phone Number: 9113973047

---

## 📝 License

This project was created as an assignment for Evivve/Gamitar Learning.

---

**Thank you for reviewing my submission! I'm excited about the opportunity to contribute to Evivve's mission of combining gaming and learning.** 🎮✨
