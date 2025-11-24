# Avatar System Documentation

## Overview

The avatar system provides a complete solution for managing user profile pictures with:

- **Gravatar Integration**: Automatic fallback to Gravatar for users without custom avatars
- **Cloudflare R2 Storage**: Custom avatars stored in R2 with automatic sharding
- **Signed URLs**: 7-day expiring signed URLs for secure avatar delivery
- **Image Validation**: File size and format validation
- **Automatic Cleanup**: Old avatars deleted when new ones are uploaded

---

## Architecture

### Avatar Resolution Priority

When retrieving a user's avatar, the system checks in this order:

1. **Custom Avatar in R2** (signed URL, valid 7 days)
2. **Stored Avatar URL** (from database)
3. **Gravatar Fallback** (default, always available)

### Storage Structure

Custom avatars are stored in Cloudflare R2 with automatic sharding:

```
PROFILE_PICS/
├── abc123/           # First 6 characters of Firebase UID (shard directory)
│   ├── abc123def456   # Full Firebase UID as filename
│   └── ...
├── xyz789/
│   ├── xyz789abc123
│   └── ...
```

**Benefits**:

- Distributed load across buckets
- Better performance
- Easier cleanup by shard

---

## Backend Implementation

### Avatar Manager Service

**Location**: `server/helpers/avatarManager.ts`

#### Key Functions

```typescript
// Get Gravatar URL for a user email
getGravatarUrl(email: string, size?: number): string

// Generate R2 storage path (with sharding)
getR2AvatarPath(firebaseUid: string): string

// Generate 7-day signed URL for R2 object
generateSignedAvatarUrl(bucket: any, firebaseUid: string): Promise<string>

// Upload avatar to R2
uploadAvatarToR2(bucket: any, firebaseUid: string, imageData: ArrayBuffer | Blob, contentType?: string): Promise<string>

// Delete avatar from R2
deleteAvatarFromR2(bucket: any, firebaseUid: string): Promise<void>

// Resolve avatar URL with priority logic
resolveAvatarUrl(firebaseUid: string, storedAvatarUrl: string | null, bucket: any, email: string): Promise<string>

// Validate image before upload
validateAvatarImage(file: Blob): boolean
```

### Avatar Routes

**Location**: `server/routes/avatar.ts`

#### Endpoints

##### GET `/api/avatar/:firebaseUid`

Get user's avatar URL (automatic Gravatar fallback)

**Response**:

```json
{
  "avatarUrl": "https://www.gravatar.com/avatar/... or https://r2.cloudflarestorage.com/..."
}
```

**Example**:

```bash
curl https://api.example.com/api/avatar/abc123def456
```

---

##### POST `/api/avatar/:firebaseUid/upload`

Upload custom avatar image

**Authentication**: Required (Bearer token)
**Content-Type**: `multipart/form-data`

**Body**:

```
image: <binary image file>
```

**Validation**:

- Max file size: 5MB
- Allowed formats: JPEG, PNG, WebP, GIF

**Response**:

```json
{
  "success": true,
  "avatarUrl": "https://r2.cloudflarestorage.com/...",
  "message": "Avatar uploaded successfully"
}
```

**Example**:

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@photo.jpg" \
  https://api.example.com/api/avatar/abc123def456/upload
```

---

##### DELETE `/api/avatar/:firebaseUid`

Delete custom avatar (revert to Gravatar)

**Authentication**: Required (Bearer token)

**Response**:

```json
{
  "success": true,
  "avatarUrl": "https://www.gravatar.com/avatar/...",
  "message": "Avatar deleted. Using Gravatar fallback."
}
```

**Example**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/avatar/abc123def456
```

---

##### POST `/api/avatar/gravatar`

Explicitly set user to use Gravatar

**Authentication**: Required (Bearer token)

**Response**:

```json
{
  "success": true,
  "avatarUrl": "https://www.gravatar.com/avatar/...",
  "message": "Avatar set to Gravatar"
}
```

---

## Frontend Implementation

### Avatar API Service

**Location**: `src/services/avatarApi.ts`

#### Functions

```typescript
// Get avatar URL for a user
getAvatarUrl(firebaseUid: string): Promise<string>

// Upload custom avatar
uploadAvatar(firebaseUid: string, imageFile: File): Promise<{
  success: boolean
  avatarUrl: string
}>

// Delete custom avatar
deleteAvatar(firebaseUid: string): Promise<{
  success: boolean
  avatarUrl: string
}>

// Set avatar to Gravatar
setGravatar(firebaseUid: string): Promise<{
  success: boolean
  avatarUrl: string
}>

// Validate image file before upload
validateImageFile(file: File): boolean
```

### Avatar Manager Component

**Location**: `src/components/AvatarManager.vue`

A complete Vue 3 component for managing user avatars with:

- Avatar display
- Upload functionality
- Gravatar integration
- Delete custom avatar
- Error/success messages
- Loading states
- Accessibility features
- Responsive design

#### Usage

```vue
<template>
  <AvatarManager
    :firebaseUid="user.firebase_uid"
    :userName="user.name"
    :userEmail="user.email"
  />
</template>

<script setup>
import { ref } from "vue"
import AvatarManager from "@/components/AvatarManager.vue"

const user = ref({
  firebase_uid: "abc123def456",
  name: "John Doe",
  email: "john@example.com",
})
</script>
```

#### Features

- ✅ Displays current avatar with hover effect
- ✅ File upload with validation
- ✅ Gravatar option
- ✅ Delete custom avatar
- ✅ Loading states
- ✅ Error handling with timeouts
- ✅ Success confirmations
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Responsive design (mobile-friendly)

---

## Configuration

### Environment Variables

No additional environment variables required. Uses existing `VITE_API_URL` if set.

### Cloudflare Workers Configuration

**wrangler.jsonc**:

```json
"r2_buckets": [
  {
    "bucket_name": "ffs-app-profile",
    "binding": "PROFILE_PICS"
  }
]
```

✅ Already configured in your project

---

## Image Validation

### Frontend Validation

```typescript
validateImageFile(file: File): boolean
```

Checks:

- Maximum file size: **5MB**
- Allowed formats: **JPEG, PNG, WebP, GIF**

### Backend Validation

Same validation also performed server-side for security.

---

## Signed URL Details

### Duration: 7 Days

Generated signed URLs expire after 7 days. When expired:

1. Frontend attempts to fetch new signed URL
2. Backend generates fresh signed URL
3. User receives updated avatar URL

### URL Format

Example signed URL:

```
https://r2.cloudflarestorage.com/ffs-app-profile/abc123/abc123def456?X-Amz-Algorithm=...&X-Amz-Expires=604800&...
```

### Security

- ✅ Time-limited (7 days)
- ✅ User-specific path
- ✅ Signed by Cloudflare
- ✅ Cannot be forged

---

## Database Updates

When avatar is uploaded/deleted, the user record is updated:

```typescript
{
  avatar: "r2_custom" // Flag indicating custom avatar in R2
  updated_at: new Date().toISOString()
}
```

Or set to `null` when reverted to Gravatar.

---

## Usage Examples

### Example 1: Display User Avatar

```vue
<script setup>
import { ref, onMounted } from "vue"
import { getAvatarUrl } from "@/services/avatarApi"

const avatarUrl = ref("")

onMounted(async () => {
  avatarUrl.value = await getAvatarUrl("user-firebase-uid")
})
</script>

<template>
  <img :src="avatarUrl" alt="User avatar" class="avatar" />
</template>
```

### Example 2: Full Avatar Manager

```vue
<template>
  <AvatarManager
    :firebaseUid="currentUser.firebase_uid"
    :userName="currentUser.name"
    :userEmail="currentUser.email"
  />
</template>

<script setup>
import { computed } from "vue"
import { useUserStore } from "@/stores/user"
import AvatarManager from "@/components/AvatarManager.vue"

const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)
</script>
```

### Example 3: Manual Upload

```typescript
import { uploadAvatar, validateImageFile } from "@/services/avatarApi"

const handleUpload = async (file: File) => {
  try {
    // Validate
    validateImageFile(file)

    // Upload
    const result = await uploadAvatar("user-firebase-uid", file)

    console.log("New avatar URL:", result.avatarUrl)
  } catch (error) {
    console.error("Upload failed:", error.message)
  }
}
```

---

## Troubleshooting

### Avatar not loading

1. Check browser console for errors
2. Verify Firebase UID is correct
3. Check user exists in database
4. Verify R2 bucket is accessible

### Upload fails with "Image too large"

- Resize image to under 5MB
- Use JPEG format for smaller files
- Use image compression tool

### Upload fails with "Invalid image format"

- Use JPEG, PNG, WebP, or GIF
- Check file extension matches content
- Try uploading a different file

### Signed URL expired

- This is expected after 7 days
- Frontend will automatically fetch new URL
- No manual action required

### Gravatar not showing

- Verify email address is correct
- Gravatar may not have avatar for email
- This is expected - Gravatar shows identicon fallback

---

## Best Practices

### Frontend

✅ Always validate file before upload
✅ Show loading state during upload
✅ Display success/error messages
✅ Handle network failures gracefully
✅ Use Pinia store for current user data
✅ Cache avatar URLs appropriately

### Backend

✅ Validate file server-side
✅ Check user permissions (user can only upload own avatar)
✅ Log avatar operations for audit trail
✅ Set appropriate cache headers
✅ Clean up old avatars when new ones uploaded
✅ Monitor R2 storage usage

---

## Performance Considerations

### Optimization

- ✅ Avatars stored with 30-day cache headers
- ✅ Signed URLs cached for 7 days
- ✅ R2 distribution via sharding
- ✅ Gravatar served from CDN
- ✅ Image validation prevents large uploads

### Monitoring

Track:

- Upload success rate
- Average file size
- Storage usage
- Signed URL generation time

---

## Security

### Authorization

- ✅ Users can only upload their own avatar
- ✅ Users can only delete their own avatar
- ✅ Bearer token required for uploads/deletes
- ✅ Firebase UID verified

### Data Protection

- ✅ Images stored in private R2 bucket
- ✅ Signed URLs prevent direct linking
- ✅ File types validated
- ✅ Size limits prevent abuse
- ✅ Custom metadata tracks uploads

---

## Future Enhancements

Potential improvements:

- [ ] Image cropping tool
- [ ] Multiple avatar formats (WebP optimization)
- [ ] Avatar history/rollback
- [ ] Social avatar linking (GitHub profile pic, etc.)
- [ ] Batch avatar upload for admins
- [ ] Analytics on avatar usage

---

**Status**: ✅ Production Ready

For questions or issues, check error messages in browser console and API responses.
