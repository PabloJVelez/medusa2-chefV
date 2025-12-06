# Magic Link Authentication for Chef Events

## Overview

This document describes the magic link authentication system implemented for chef event notifications. The system allows chefs to click a link in their email and be taken directly to the event details page.

## Implementation

### Components

1. **Magic Link Token Generation** (`src/modules/utils/magic-link.ts`)
   - Generates secure, time-limited tokens using HMAC-SHA256
   - Tokens are valid for 48 hours
   - Format: `{eventId}.{timestamp}.{signature}`
   - Uses `JWT_SECRET` environment variable for signing

2. **Authentication API Route** (`src/api/auth/magic-link/[token]/route.ts`)
   - Verifies magic link tokens
   - Validates token signature and expiration
   - Redirects to event detail page or error page

3. **Email Template Update** (`src/modules/resend/emails/chef-event-requested.tsx`)
   - Replaced Accept/Decline buttons with single "View Event Request" button
   - Button links to magic link URL
   - Displays token validity information (48 hours)

4. **Subscriber Update** (`src/subscribers/chef-event-requested.ts`)
   - Generates magic link URL for each chef notification
   - Includes magic link in email data

## How It Works

### Token Generation

When a chef event is requested:
1. A unique magic link token is generated for the event
2. The token includes the event ID and timestamp
3. A cryptographic signature is added using HMAC-SHA256
4. The complete token is URL-safe and can be included in emails

### Authentication Flow

When a chef clicks the magic link in their email:
1. Request is sent to `/auth/magic-link/{token}`
2. Server verifies the token:
   - Validates token structure
   - Checks signature authenticity
   - Verifies token hasn't expired (48 hours)
3. If valid, chef is redirected to `/app/chef-events/{eventId}`
4. If invalid or expired, chef is redirected to admin with error message

### Security Features

- **Time-Limited**: Tokens expire after 48 hours
- **Signed**: HMAC-SHA256 signature prevents tampering
- **Event-Specific**: Each token is tied to a specific event
- **One-Time Use Recommended**: While technically reusable within the validity period, the workflow encourages single use

## Current Behavior

### Authentication Requirement

**Important**: The current implementation redirects users to the event page, but they must still be authenticated with the Medusa admin panel to view it. This means:

- If the chef is already logged into the admin panel, they'll see the event immediately
- If not logged in, they'll be redirected to the admin login page first
- After logging in, they'll be taken to the event details page

This approach balances security with convenience:
- ✅ Provides quick access via email
- ✅ Maintains security by requiring authentication
- ✅ No password storage in emails
- ✅ Time-limited access tokens

### User Experience

For chefs:
1. Receive email notification with "View Event Request" button
2. Click button → taken to authentication page (if not logged in)
3. Log in with their regular admin credentials
4. Automatically redirected to event details page
5. Can accept/reject event from admin panel

## Future Enhancements

### True Passwordless Authentication (Optional)

If you want chefs to access the event without logging in, you would need to implement:

1. **Session Creation on Magic Link Verification**
   - Generate a JWT token for the user
   - Set authentication cookie/session
   - Requires integration with Medusa's auth module

2. **Temporary Admin Access**
   - Create a limited-access session
   - Restrict to viewing/managing only the specific event
   - Auto-expire after action taken

3. **Custom Auth Provider**
   - Implement a custom Medusa auth provider
   - Support magic link as an authentication method
   - Register with Medusa's authentication system

### Implementation Example (Pseudocode)

```typescript
// Enhanced magic link route with session creation
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const eventId = verifyMagicLinkToken(token)
  
  if (!eventId) {
    return res.redirect('/admin?error=invalid_token')
  }
  
  // Create temporary authentication session
  const authService = req.scope.resolve(Modules.AUTH)
  const jwt = await authService.createToken({
    actor_type: 'user',
    actor_id: CHEF_USER_ID,
    auth_provider: 'magic-link'
  })
  
  // Set session cookie
  res.cookie('medusa_auth_token', jwt, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000 // 1 hour
  })
  
  // Redirect to event page
  res.redirect(`/app/chef-events/${eventId}`)
}
```

## Configuration

### Environment Variables

- `JWT_SECRET`: Used for signing magic link tokens (required)
- `ADMIN_BACKEND_URL`: Base URL for admin panel redirects (required)
- `MEDUSA_ADMIN_URL`: Alternative admin URL (optional)

### Token Validity

To change the token validity period, update the constant in `magic-link.ts`:

```typescript
const TOKEN_VALIDITY_HOURS = 48 // Change this value
```

## Testing

### Manual Testing

1. Create a test chef event through the storefront
2. Check chef notification email for "View Event Request" button
3. Click button and verify:
   - Valid token redirects to login (if not authenticated)
   - After login, redirects to event details page
   - Invalid/expired token shows error message

### Test Token Generation

```typescript
import { generateMagicLinkToken, verifyMagicLinkToken } from './modules/utils/magic-link'

// Generate token
const token = generateMagicLinkToken('chef-event-id-123')
console.log('Token:', token)

// Verify token
const eventId = verifyMagicLinkToken(token)
console.log('Event ID:', eventId) // Should output: chef-event-id-123
```

## Security Considerations

1. **HTTPS Required**: Always use HTTPS in production to prevent token interception
2. **Secure JWT_SECRET**: Use a strong, random secret for token signing
3. **Rate Limiting**: Consider adding rate limiting to the magic link endpoint
4. **IP Validation**: Optionally validate that requests come from expected IP ranges
5. **Audit Logging**: Log magic link usage for security auditing

## Troubleshooting

### Magic Link Not Working

1. Check JWT_SECRET is set correctly
2. Verify ADMIN_BACKEND_URL is correct
3. Check token hasn't expired (48 hours)
4. Ensure HTTPS is used in production

### Redirect Issues

1. Verify environment variables are set:
   - `ADMIN_BACKEND_URL`
   - `MEDUSA_ADMIN_URL`
2. Check admin panel is accessible at configured URL
3. Verify chef has admin user account

### Email Not Sending

1. Check CHEF_NOTIFICATIONS_LIST environment variable
2. Verify Resend integration is configured
3. Check subscriber is processing events correctly
4. Review logs for error messages

