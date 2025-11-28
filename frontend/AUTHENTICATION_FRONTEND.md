# Frontend Authentication Implementation

Complete guide to the authentication system implemented in the Woodwork frontend.

## Overview

The frontend uses:

- **Apollo Client** for GraphQL communication
- **Redux Toolkit** for state management
- **JWT tokens** stored in localStorage
- **Private routes** with automatic redirection

## Architecture

### Authentication Flow

1. **User Registration/Login**:
   - User submits credentials via Login or Register page
   - GraphQL mutation sent to backend
   - Backend returns JWT token + user data
   - Token stored in localStorage
   - User data stored in Redux
   - User redirected to dashboard

2. **Authenticated Requests**:
   - Apollo Client automatically adds JWT to all requests
   - Token sent in `Authorization: Bearer <token>` header
   - Backend validates token and returns user-specific data

3. **Automatic Logout**:
   - Invalid/expired tokens trigger automatic logout
   - User redirected to login page
   - Local storage cleared

4. **Protected Routes**:
   - All app routes require authentication
   - Unauthenticated users redirected to `/login`
   - Login/Register pages are public

## File Structure

```
src/
├── lib/
│   └── apolloClient.ts          # Apollo Client configuration
├── graphql/
│   ├── auth.ts                  # Auth queries/mutations
│   └── operations.ts            # All GraphQL operations
├── store/
│   ├── authSlice.ts             # Authentication state
│   └── store.ts                 # Redux store configuration
├── pages/
│   ├── Login.tsx                # Login page
│   └── Register.tsx             # Registration page
├── components/
│   ├── PrivateRoute.tsx         # Route protection
│   └── Sidebar.tsx              # Updated with logout
└── main.tsx                     # Apollo Provider setup
```

## Key Components

### 1. Apollo Client (`src/lib/apolloClient.ts`)

**Features**:

- HTTP link to backend GraphQL endpoint
- Auth link that adds JWT to all requests
- Error link for automatic logout on auth failures
- Cache configuration

**Configuration**:

```typescript
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
```

### 2. Auth Slice (`src/store/authSlice.ts`)

**State**:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
```

**Actions**:

- `setCredentials(user, token)` - Store user and token after login/register
- `updateUser(user)` - Update user profile
- `logout()` - Clear auth state
- `loadUserFromStorage()` - Restore auth from localStorage

### 3. GraphQL Operations (`src/graphql/auth.ts`)

**Mutations**:

- `REGISTER` - Create new account
- `LOGIN` - Authenticate user
- `UPDATE_USER` - Update profile
- `CHANGE_PASSWORD` - Change password

**Queries**:

- `GET_ME` - Get current authenticated user

### 4. Private Route (`src/components/PrivateRoute.tsx`)

Protects routes from unauthenticated access:

```typescript
<PrivateRoute>
  <App />
</PrivateRoute>
```

Redirects to `/login` if `isAuthenticated === false`.

### 5. Login Page (`src/pages/Login.tsx`)

**Features**:

- Username/password form
- Password visibility toggle
- Loading states
- Error handling
- Link to registration

**Usage**:

```typescript
const [login, { loading }] = useMutation(LOGIN, {
  onCompleted: (data) => {
    dispatch(setCredentials(data.login));
    navigate('/');
  },
});
```

### 6. Register Page (`src/pages/Register.tsx`)

**Features**:

- Full registration form (first/last name, username, email, password)
- Password confirmation
- Terms acceptance checkbox
- Client-side validation
- Error handling
- Link to login

## Usage

### Setting Up Environment

1. Create `.env` file:

```bash
cp .env.example .env
```

2. Configure backend URL:

```env
VITE_API_URL=http://localhost:4000/graphql
```

### Running the App

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Access the app:

- **Public**: `http://localhost:5173/login` or `/register`
- **Private**: All other routes require authentication

### Login Flow Example

1. Navigate to `/login`
2. Enter credentials
3. Click "Sign In"
4. On success:
   - Token saved to localStorage
   - User data saved to Redux
   - Redirected to dashboard (`/`)
5. On error:
   - Error message displayed
   - User can retry

### Logout Flow

1. Click "Logout" in sidebar
2. Redux state cleared
3. localStorage cleared
4. Redirected to `/login`

## Integration with Components

### Using Authentication State

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

function MyComponent() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.firstName}!</p>}
    </div>
  );
}
```

### Making Authenticated Requests

Apollo Client automatically adds the JWT token. Just use the queries/mutations:

```typescript
import { useQuery } from '@apollo/client';
import { GET_LUMBERS } from '../graphql';

function LumberList() {
  const { data, loading, error } = useQuery(GET_LUMBERS, {
    variables: { includeDeleted: false },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.lumbers.map(lumber => (
        <div key={lumber.id}>{lumber.name}</div>
      ))}
    </div>
  );
}
```

### Logout from Anywhere

```typescript
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Security Features

### Token Storage

**Current**: localStorage

- ✅ Simple implementation
- ✅ Persists across sessions
- ⚠️ Vulnerable to XSS attacks

**Best Practice for Production**:
Consider using httpOnly cookies for enhanced security.

### Automatic Token Refresh

Currently, tokens expire after 7 days (backend configuration). On expiration:

1. Backend returns `UNAUTHENTICATED` error
2. Error link catches it
3. User automatically logged out
4. Redirected to login

### CORS Configuration

Backend must allow frontend origin:

```typescript
// Backend
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
```

## Error Handling

### Network Errors

```typescript
const errorLink = onError(({ networkError }) => {
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Show user-friendly error message
  }
});
```

### GraphQL Errors

```typescript
const errorLink = onError(({ graphQLErrors }) => {
  graphQLErrors?.forEach(({ message, extensions }) => {
    if (extensions?.code === 'UNAUTHENTICATED') {
      // Auto-logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  });
});
```

### Form Validation

Client-side validation in Register page:

- Required fields check
- Password length (min 6 characters)
- Password confirmation match
- Terms acceptance

## Troubleshooting

### "Not authenticated" errors

**Symptoms**: Redirected to login immediately

**Solutions**:

1. Check token exists: `localStorage.getItem('authToken')`
2. Check token is valid (not expired)
3. Verify backend is running
4. Check CORS configuration
5. Inspect browser Network tab

### Token not being sent

**Symptoms**: Backend returns authentication errors

**Solutions**:

1. Check Apollo Client auth link is configured
2. Verify token in localStorage
3. Check Authorization header in Network tab
4. Ensure token format is `Bearer <token>`

### Redux state not persisting

**Symptoms**: User logged out on page refresh

**Solutions**:

1. Check `loadUserFromStorage()` is called in `main.tsx`
2. Verify token and user data in localStorage
3. Check Redux DevTools for state

### CORS errors

**Symptoms**: Network errors, "blocked by CORS policy"

**Solutions**:

1. Check backend CORS configuration
2. Verify `VITE_API_URL` in `.env`
3. Ensure backend is running
4. Check browser console for specific CORS error

## Testing Authentication

### Manual Testing

1. **Register Flow**:

   ```
   1. Go to /register
   2. Fill form with new user
   3. Accept terms
   4. Submit
   5. Should redirect to dashboard
   ```

2. **Login Flow**:

   ```
   1. Go to /login
   2. Enter credentials
   3. Submit
   4. Should redirect to dashboard
   ```

3. **Protected Routes**:

   ```
   1. Logout
   2. Try to access /dashboard or /lumber
   3. Should redirect to /login
   ```

4. **Token Expiration**:
   ```
   1. Login
   2. Clear authToken from localStorage
   3. Try to access protected route
   4. Should redirect to /login
   ```

### Browser DevTools

**Check Token**:

```javascript
// In browser console
localStorage.getItem('authToken');
```

**Check User**:

```javascript
JSON.parse(localStorage.getItem('currentUser'));
```

**Check Redux State**:
Install Redux DevTools extension and inspect `auth` slice.

## Best Practices

### ✅ DO:

- Always check `isAuthenticated` before showing protected content
- Handle loading states in mutations
- Show user-friendly error messages
- Clear sensitive data on logout
- Use HTTPS in production
- Implement token refresh for better UX

### ❌ DON'T:

- Store passwords in state/localStorage
- Ignore authentication errors
- Skip loading states
- Use global error handlers for auth (handle per-component)
- Hardcode API URLs (use environment variables)

## Future Enhancements

Potential improvements:

1. **Token Refresh**:
   - Implement refresh tokens
   - Auto-refresh before expiration
   - Better UX (no forced logout)

2. **Remember Me**:
   - Longer-lived tokens for "remember me"
   - Option to stay logged in

3. **Social Login**:
   - Google, GitHub, etc.
   - OAuth integration

4. **Two-Factor Authentication**:
   - TOTP-based 2FA
   - SMS verification

5. **Session Management**:
   - View active sessions
   - Logout from all devices

6. **Password Reset**:
   - Forgot password flow
   - Email verification

## Resources

- [Apollo Client Authentication](https://www.apollographql.com/docs/react/networking/authentication/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Router Authentication](https://reactrouter.com/en/main/start/overview)
