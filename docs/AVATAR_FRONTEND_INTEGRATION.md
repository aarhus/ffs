# Avatar System - Frontend Integration

## Overview

The avatar system has been fully integrated into the Vue frontend with dynamic avatar loading in the sidebar and full upload/management capabilities in the Profile page.

## Integration Points

### 1. Sidebar Avatar Display (`src/components/SidebarContent.vue`)

**Features:**

- Dynamically loads user avatar from backend API
- Falls back to user initials if avatar fails to load
- Watches for user changes and reloads avatar automatically
- Uses proper `firebase_uid` property from User model

**Implementation:**

```vue
<img
  v-if="avatarUrl"
  :src="avatarUrl"
  :alt="currentUser.name"
  class="w-10 h-10 rounded-full object-cover"
/>
<div v-else class="w-10 h-10 rounded-full bg-primary/20">
  {{ currentUser.name.charAt(0).toUpperCase() }}
</div>
```

**Key Functions:**

- `loadAvatar()` - Fetches avatar URL from API on mount and when user changes
- Uses `getAvatarUrl()` from `avatarApi.ts`

### 2. Profile Page Avatar Manager (`src/components/ProfilePage.vue`)

**Features:**

- Displays AvatarManager component for full avatar management
- Allows users to upload custom avatars
- Switch between custom avatar and Gravatar
- Delete custom avatars

**Implementation:**

```vue
<AvatarManager
  v-if="currentUser.firebase_uid"
  :firebaseUid="currentUser.firebase_uid"
  :userName="currentUser.name"
  :userEmail="currentUser.email"
/>
```

### 3. Avatar Manager Component (`src/components/AvatarManager.vue`)

**Features:**

- Large avatar preview (128x128px) with hover scale effect
- Upload button with file input (JPEG, PNG, WebP, GIF up to 5MB)
- "Use Gravatar" button (only shown when using custom avatar)
- "Delete Custom Avatar" button (only shown when using custom avatar)
- Loading, error, and success states
- Full Tailwind CSS styling (no custom CSS variables)
- Responsive design (mobile and desktop)
- Accessibility support (ARIA labels, keyboard navigation)

**Component Props:**

```typescript
interface Props {
  firebaseUid: string // User's Firebase UID
  userName: string // For alt text
  userEmail: string // For Gravatar generation
}
```

**Key Functions:**

- `loadAvatar()` - Fetch current avatar URL
- `handleFileSelect()` - Upload new avatar image
- `handleDeleteAvatar()` - Delete custom avatar, revert to Gravatar
- `handleSetGravatar()` - Explicitly set to Gravatar
- `onAvatarLoadError()` - Handle image load failures

### 4. Avatar API Service (`src/services/avatarApi.ts`)

**API Endpoints:**
All endpoints use `/api/` prefix as per backend architecture.

```typescript
// GET avatar URL (public or authenticated)
getAvatarUrl(firebaseUid: string): Promise<string>
// → GET /api/avatar/{firebaseUid}

// Upload custom avatar (authenticated)
uploadAvatar(firebaseUid: string, imageFile: File): Promise<{...}>
// → POST /api/avatar/{firebaseUid}/upload

// Delete custom avatar (authenticated)
deleteAvatar(firebaseUid: string): Promise<{...}>
// → DELETE /api/avatar/{firebaseUid}

// Set to Gravatar (authenticated)
setGravatar(firebaseUid: string): Promise<{...}>
// → POST /api/avatar/{firebaseUid}/gravatar
```

**Helper Functions:**

- `validateImageFile(file: File)` - Frontend validation (5MB max, valid types)
- `getAuthToken()` - Get Firebase JWT for authenticated requests

## User Flow

### Viewing Avatar

1. User logs in
2. Sidebar calls `getAvatarUrl(firebase_uid)` on mount
3. API returns either:
   - R2 signed URL (custom avatar)
   - Gravatar URL (email-based)
4. Avatar displays in sidebar

### Uploading Avatar

1. User navigates to Profile page
2. Clicks "Upload Photo" button
3. Selects image file (JPEG/PNG/WebP/GIF < 5MB)
4. Frontend validates file
5. Uploads to `/api/avatar/{uid}/upload` with Bearer token
6. Backend validates, uploads to R2, updates database
7. Returns new signed URL
8. Avatar updates immediately in UI

### Deleting Avatar

1. User clicks "Delete Custom Avatar"
2. Confirms deletion
3. Frontend calls DELETE `/api/avatar/{uid}`
4. Backend removes from R2, sets avatar field to null
5. Returns Gravatar URL
6. Avatar updates to Gravatar

### Switching to Gravatar

1. User clicks "Use Gravatar"
2. Frontend calls POST `/api/avatar/{uid}/gravatar`
3. Backend removes R2 file, sets avatar to null
4. Returns Gravatar URL
5. Avatar updates to Gravatar

## Styling

Uses **Tailwind CSS** exclusively:

- `bg-primary` - Primary color buttons
- `bg-destructive` - Delete button
- `bg-success/10` - Success messages
- `bg-destructive/10` - Error messages
- `rounded-full` - Circular avatars
- `hover:scale-105` - Interactive effects
- `animate-pulse` - Loading state

No custom CSS variables required.

## Security

✅ All uploads require Firebase JWT authentication
✅ Backend verifies user can only modify their own avatar
✅ File validation on frontend AND backend
✅ Signed URLs expire after 7 days
✅ Proper error handling and user feedback

## Testing Checklist

- [ ] Sidebar displays avatar on login
- [ ] Sidebar shows initials if avatar fails to load
- [ ] Profile page shows AvatarManager component
- [ ] Upload button accepts valid image files
- [ ] Upload rejects files > 5MB
- [ ] Upload rejects invalid file types
- [ ] Avatar updates in both sidebar and profile after upload
- [ ] Delete button reverts to Gravatar
- [ ] "Use Gravatar" button removes custom avatar
- [ ] Error messages display for failed operations
- [ ] Success messages display for successful operations
- [ ] Loading states show during operations
- [ ] Component is responsive on mobile
- [ ] Keyboard navigation works properly

## Known Issues

None currently. All TypeScript errors resolved.

## Future Enhancements

- [ ] Avatar cropping/resizing tool before upload
- [ ] Drag-and-drop file upload
- [ ] Image preview before upload
- [ ] Progress bar for large uploads
- [ ] Avatar history/rollback
- [ ] Bulk avatar management for admins

## Troubleshooting

**Avatar not loading in sidebar:**

- Check browser console for API errors
- Verify `firebase_uid` exists on user object
- Check network tab for 401/403 errors
- Ensure backend is running and `/api/avatar/*` routes work

**Upload failing:**

- Check file size (must be < 5MB)
- Check file type (JPEG, PNG, WebP, GIF only)
- Verify Firebase authentication token is valid
- Check browser console for specific error messages
- Verify R2 bucket binding in wrangler.jsonc

**Gravatar not showing:**

- Verify user email address is correct
- Check Gravatar.com to see if email has registered avatar
- Check network tab to see if Gravatar URL is being requested
- Gravatar uses MD5 hash of lowercase, trimmed email

## Files Modified

1. ✅ `src/components/SidebarContent.vue` - Added avatar loading logic
2. ✅ `src/components/ProfilePage.vue` - Integrated AvatarManager component
3. ✅ `src/components/AvatarManager.vue` - Converted to Tailwind CSS
4. ✅ `src/services/avatarApi.ts` - Fixed `/api/` prefix on all endpoints

## Status

✅ **Complete and ready for testing**

All components compile with 0 TypeScript errors. Avatar system is fully integrated into the frontend with proper authentication, error handling, and responsive design.
