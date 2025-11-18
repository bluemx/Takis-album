# User Data Loading System

## Overview

This system handles loading user data (name, avatar, owned cards) at application startup and integrates it seamlessly with your album interface.

## Architecture

### 🗂️ **Files Created**

1. **`src/stores/user.ts`** - Pinia store for user data management
2. **`src/components/UserLoader.vue`** - Loading screen and user initialization
3. **`src/components/UserCollection.vue`** - Example collection viewer (optional)
4. **Updated `src/App.vue`** - Main app with user integration

### 📊 **Data Flow**

```
App Start → UserLoader → Load User Data → Show Album Interface
                ↓
            User Store (Pinia)
                ↓
        User Data + Owned Cards
                ↓
        Album Components (with ownership info)
```

## User Data Structure

### UserData Interface
```typescript
interface UserData {
  id: string
  name: string
  avatar: string
  joinDate?: string
  level?: number
  totalCards?: number
}
```

### OwnedCard Interface  
```typescript
interface OwnedCard {
  cardId: number
  quantity: number
  obtainedDate?: string
  rarity?: string
}
```

### API Response Expected
```typescript
interface UserApiResponse {
  user: UserData
  ownedCards: OwnedCard[]
}
```

## How to Integrate with Your API

### 1. Replace Mock API Call

In `src/stores/user.ts`, replace the `fetchUserData` function:

```typescript
const fetchUserData = async (userId: string): Promise<UserApiResponse> => {
  // Replace with your actual API endpoint
  const response = await fetch(`/api/users/${userId}/album-data`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  // Ensure data matches UserApiResponse interface
  return {
    user: data.user,
    ownedCards: data.ownedCards || []
  }
}
```

### 2. Update Authentication Integration

In `src/components/UserLoader.vue`, update the `getUserIdFromAuth` function:

```typescript
function getUserIdFromAuth(): string | null {
  // Option 1: From localStorage
  return localStorage.getItem('userId')
  
  // Option 2: From JWT token
  const token = localStorage.getItem('authToken')
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId
  }
  
  // Option 3: From cookies
  return getCookie('userId')
  
  // Option 4: From your auth provider
  return yourAuthProvider.getCurrentUserId()
}
```

### 3. Handle Different User States

The system handles multiple scenarios:

- **Loading State**: Shows spinner and loading message
- **Error State**: Shows error with retry option
- **Success State**: Shows user info and collection stats
- **No User State**: Prompts to log in or load demo

## Using User Data in Components

### Check if User Owns a Card

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Check ownership
const ownsCard = userStore.ownsCard(cardId)
const cardQuantity = userStore.getCardQuantity(cardId)
</script>

<template>
  <div v-if="userStore.ownsCard(123)" class="owned-card">
    ✅ You own {{ userStore.getCardQuantity(123) }} of this card
  </div>
</template>
```

### Display User Info

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.isLoggedIn" class="user-info">
    <img :src="userStore.userAvatar" :alt="userStore.userName">
    <h2>{{ userStore.userName }}</h2>
    <p>{{ userStore.totalOwnedCards }} cards owned</p>
  </div>
</template>
```

### Enhanced Album Store Integration

The album store now provides user-aware methods:

```typescript
// In your component
const albumStore = useAlbumStore()
const userStore = useUserStore()

// Get cards with ownership info
const cardsWithOwnership = albumStore.getCardsWithOwnership(userStore)
const cardWithOwnership = albumStore.getCardWithOwnership(userStore)(cardId)
```

## Features Included

### 🎯 **UserLoader Component**
- ✅ Loading animation and states
- ✅ Error handling with retry
- ✅ User stats display (total cards, progress)
- ✅ Avatar handling with fallbacks
- ✅ Demo user support for testing

### 🏪 **User Store**
- ✅ Complete user data management
- ✅ Owned cards tracking with quantities
- ✅ Reactive ownership checking
- ✅ Add/remove cards functionality
- ✅ Collection statistics

### 📱 **App Integration**
- ✅ User info bar (collapsible)
- ✅ Collection progress display
- ✅ Seamless transition from loading to album
- ✅ User menu with reload option

### 🎨 **UserCollection Component (Optional)**
- ✅ Collection statistics dashboard
- ✅ Progress by category
- ✅ Recent cards display
- ✅ Export functionality
- ✅ Simulate new cards (for testing)

## Startup Sequence

1. **App.vue loads** with `isReady = false`
2. **UserLoader.vue mounts** and attempts to load user data
3. **User ID retrieved** from your auth system
4. **API call made** to fetch user data and owned cards
5. **Data stored** in Pinia user store
6. **Success screen shown** with user info and stats
7. **User clicks continue** → `isReady = true`
8. **Album interface loads** with full user integration

## Configuration Options

### Environment Variables
```env
# API endpoints
VITE_API_BASE_URL=https://your-api.com
VITE_USER_API_ENDPOINT=/api/users

# Features
VITE_ENABLE_DEMO_USER=true
VITE_SHOW_USER_MENU=true
```

### Customization Points
- Loading messages and animations
- Error handling strategies
- User avatar fallback images
- Collection progress calculations
- Demo data configuration

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Retry with exponential backoff
- **Invalid data**: Graceful degradation
- **Missing user**: Redirect to login or demo
- **Avatar loading**: Fallback to default image
- **API timeouts**: User-friendly error messages

## Testing

### Demo Mode
```typescript
// Load demo user for testing
await userStore.loadDemoUser()
```

### Mock Different States
```typescript
// Simulate loading error
userStore.loadState.error = 'Network connection failed'

// Simulate different user data
userStore.setUserData({
  id: 'test-user',
  name: 'Test User',
  avatar: '/test-avatar.png'
})
```

## Production Checklist

- [ ] Replace mock API with real endpoints
- [ ] Configure authentication integration
- [ ] Set up proper error logging
- [ ] Add loading state persistence
- [ ] Configure avatar CDN/storage
- [ ] Test offline scenarios
- [ ] Set up user data caching
- [ ] Configure progress analytics

## Example API Integration

Here's a complete example of integrating with a real API:

```typescript
// In user store
const fetchUserData = async (userId: string): Promise<UserApiResponse> => {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}/album`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle auth error
      throw new Error('Authentication required')
    }
    throw new Error(`API Error: ${response.status}`)
  }
  
  return await response.json()
}
```

Your backend should return data in this format:
```json
{
  "user": {
    "id": "user123",
    "name": "John Doe", 
    "avatar": "https://cdn.yoursite.com/avatars/user123.jpg",
    "joinDate": "2024-01-15T00:00:00Z",
    "level": 12
  },
  "ownedCards": [
    {
      "cardId": 1,
      "quantity": 2,
      "obtainedDate": "2024-02-01T10:30:00Z",
      "rarity": "common"
    }
  ]
}
```

The system is now ready to handle real user data and provides a solid foundation for your album application!