# Goal Tracker App

A minimalist, brutalist-inspired goal tracking application with customizable themes.

## Features

- Add and track goals with urgency and importance levels
- Mark goals as complete/incomplete
- Progress tracking
- Customizable color themes (6 options)
- Local storage persistence
- Clean, modern UI with sharp edges and bold typography

## Current Data Structure

### localStorage Keys

The application currently stores data in the browser's localStorage with the following keys:

#### 1. `goals` (JSON array)
Stores all goal items with the following schema:

```json
[
  {
    "text": "Goal description string",
    "completed": true/false,
    "importance": "High" or "Low",
    "urgency": "High" or "Low"
  }
]
```

#### 2. `themeColor` (string)
Stores the user's selected theme color. Possible values:
- `"black"` (default)
- `"blue"`
- `"orange"`
- `"green"`
- `"pink"`
- `"purple"`

## Database Migration Guide

When moving from localStorage to an online database, you'll need to consider the following:

### Recommended Database Schema

#### Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
  settings_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  theme_color VARCHAR(20) DEFAULT 'black',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Goals Table
```sql
CREATE TABLE goals (
  goal_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  importance VARCHAR(10) CHECK (importance IN ('High', 'Low')),
  urgency VARCHAR(10) CHECK (urgency IN ('High', 'Low')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL
);
```

### Migration Considerations

1. **User Authentication**: Add authentication system (Firebase, Auth0, custom JWT, etc.)

2. **Data Migration Path**:
   - Read existing localStorage data
   - Provide "Import from Browser" button for first-time users
   - Sync localStorage → database on user signup

3. **API Endpoints Needed**:
   ```
   POST   /api/goals              - Create new goal
   GET    /api/goals              - Get all user goals
   PUT    /api/goals/:id          - Update goal
   DELETE /api/goals/:id          - Delete goal
   DELETE /api/goals              - Delete all goals
   
   GET    /api/settings           - Get user settings
   PUT    /api/settings/theme     - Update theme color
   ```

4. **localStorage References to Replace**:
   - Line 92-93 in `script.js`: `localStorage.setItem('goals', goalsJSON)`
   - Line 129 in `script.js`: `localStorage.getItem('goals')`
   - Line 142 in `script.js`: `localStorage.removeItem('goals')`
   - Line 27 in `script.js`: `localStorage.setItem('themeColor', colorName)`
   - Line 31 in `script.js`: `localStorage.getItem('themeColor')`

5. **Offline Support** (optional but recommended):
   - Keep localStorage as cache
   - Implement sync on reconnection
   - Use Service Workers for offline functionality
   - IndexedDB for larger data sets

6. **Additional Features to Consider**:
   - Goal ordering/sorting
   - Goal categories/tags
   - Due dates
   - Goal history/archive
   - Goal sharing
   - Daily/weekly goal limits
   - Streak tracking
   - Analytics dashboard

## Development

### File Structure
```
/
├── index.html       - Main HTML structure
├── styles.css       - Brutalist styling with CSS variables
├── script.js        - Core functionality and data management
└── README.md        - This file
```

### Key JavaScript Functions

- `saveGoals()` - Saves goals array to localStorage (line 72)
- `buildListFromLocalStorage()` - Rebuilds goal list from saved data (line 96)
- `lookForGoalsOnPageLoad()` - Loads data on app start (line 128)
- `setThemeColor()` - Updates CSS variables for theme (line 22)
- `loadThemeColor()` - Restores saved theme on load (line 30)

## Technologies Used

- Vanilla JavaScript (ES6+)
- CSS3 with CSS Custom Properties (variables)
- HTML5
- localStorage API

## Browser Support

Modern browsers with:
- CSS Grid support
- CSS Custom Properties support
- localStorage API
- ES6 JavaScript

---

**Note**: This app currently runs entirely in the browser with no server-side dependencies. All data is stored locally in the user's browser.
