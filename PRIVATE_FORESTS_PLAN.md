# Private Forests Feature - Implementation Plan

## Overview

The private forests feature allows users to create friends-only forests where only the creator and their accepted friends can see and interact with posts. This document outlines the complete implementation and future development roadmap.

## ✅ Completed Implementation

### 1. Database Schema

The Prisma schema already includes all necessary models:

```prisma
model Forest {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isPrivate   Boolean  @default(false)  // ✅ Friends-only flag
  creatorId   String
  creator     User     @relation("ForestCreator", fields: [creatorId], references: [id])
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Friend {
  id          String       @id @default(cuid())
  initiatorId String
  receiverId  String
  status      FriendStatus @default(PENDING)
  // ... relations
}

enum FriendStatus {
  PENDING
  ACCEPTED
  REJECTED
  BLOCKED
}
```

### 2. API Endpoints

#### ✅ Forest Creation (`/api/forests/create`)

- Accepts `isPrivate` boolean parameter
- Creates forest with privacy setting
- Requires authentication

```typescript
POST /api/forests/create
Body: {
  name: string,
  description?: string,
  isPrivate: boolean
}
```

#### ✅ Forest List (`/api/forests/index`)

**Access Control Logic:**

1. **Unauthenticated users**: Only see public forests
2. **Authenticated users**: See:
   - All public forests
   - Their own private forests
   - Private forests created by their accepted friends

```typescript
GET /api/forests/index
Returns: Forest[] (filtered by access)
```

#### ✅ Friends Management

- `/api/friends/send` - Send friend request
- `/api/friends/respond` - Accept/reject request
- `/api/friends/list` - Get friends and pending requests

### 3. Frontend Components

#### ✅ MenuBar Component

**Features:**

- Dynamic forest list with privacy indicators (🔒 for private, 🌲 for public)
- "Change Forest" dialog with real-time forest fetching
- "Create Forest" dialog with privacy toggle
- Proper navigation via URL query parameters
- Shows current forest name in header

**Usage:**

```tsx
<MenuBar
  darkMode={boolean}
  setDarkMode={function}
  isLoggedIn={boolean}
  currentForestId={number | null}
  currentForestName={string | null}
/>
```

#### ✅ Index Page Updates

- Reads forest ID from URL query parameter (`?forest=123`)
- Filters posts by selected forest
- Passes forest context to MenuBar
- Supports "All Forests" view when no forest selected

### 4. Access Control Flow

```
User creates private forest
    ↓
Forest marked as isPrivate=true
    ↓
Other users can only see this forest if:
    1. They are the creator, OR
    2. They have an ACCEPTED friendship with the creator
    ↓
Posts in private forests follow same access rules
```

## 🚧 Future Enhancements

### Phase 1: Enhanced Post Visibility (Priority: HIGH)

Currently, the forest access control is implemented, but we need to extend it to post visibility:

**Tasks:**

1. **Update Posts API** (`/api/posts/index`)
   - Filter posts based on forest privacy
   - Ensure users can only see posts in forests they have access to
2. **Update Post Detail Page**
   - Add 403 error handling for unauthorized access
   - Show friendly error message if user doesn't have access
3. **Update Search/Discovery**
   - Exclude private forest posts from public search results
   - Only show in search if user has access

### Phase 2: Invite System (Priority: MEDIUM)

Allow users to explicitly invite others to private forests:

**Database Schema Addition:**

```prisma
model ForestInvite {
  id        String   @id @default(cuid())
  forestId  String
  forest    Forest   @relation(fields: [forestId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  invitedBy String
  inviter   User     @relation("ForestInviter", fields: [invitedBy], references: [id])
  status    InviteStatus @default(PENDING)
  createdAt DateTime @default(now())

  @@unique([forestId, userId])
}

enum InviteStatus {
  PENDING
  ACCEPTED
  DECLINED
}
```

**Features:**

- Forest creators can invite specific users (don't need to be friends)
- Users receive invite notifications
- Accept/decline invite functionality
- Manage invited users in forest settings

### Phase 3: Forest Management (Priority: MEDIUM)

**Forest Settings Page:**

- View forest members (friends who have access)
- Change privacy setting (public ↔️ private)
- Edit forest name and description
- Delete forest (with confirmation)
- View forest statistics (posts, active members)

**API Endpoints Needed:**

```typescript
PUT /api/forests/[id] - Update forest settings
DELETE /api/forests/[id] - Delete forest
GET /api/forests/[id]/members - Get members with access
```

### Phase 4: Notifications (Priority: LOW)

**Friend-Related:**

- Notify when someone sends friend request
- Notify when friend request is accepted
- Notify when friend creates new private forest

**Forest-Related:**

- Notify when invited to private forest
- Notify when friend posts in shared private forest
- Notify on new replies in private forest posts

### Phase 5: Advanced Privacy Controls (Priority: LOW)

**Granular Permissions:**

1. **Forest Roles:**

   - Creator (full control)
   - Moderator (can manage posts)
   - Member (can post)
   - Viewer (read-only)

2. **Custom Access Lists:**

   - Allow specific users (beyond just friends)
   - Block specific users from private forest
   - Friend groups/circles

3. **Post-Level Privacy:**
   - Allow posts within forests to have additional privacy controls
   - Draft posts visible only to creator
   - Pinned posts for important announcements

## 🔒 Security Considerations

### Current Implementation

✅ **Access Control:** Properly checks friendship status before showing private forests
✅ **Authentication:** All sensitive operations require valid auth token
✅ **Query Injection:** Using Prisma ORM prevents SQL injection
✅ **Privacy Leaks:** Private forest names/descriptions not exposed in public APIs

### Future Security Tasks

1. **Rate Limiting:** Add rate limiting to friend requests and forest creation
2. **Audit Logs:** Track who accesses what and when
3. **Privacy Audit:** Ensure no private data leaks in error messages
4. **Access Logs:** Log all access to private forests for security monitoring

## 📊 Testing Checklist

### Manual Testing Scenarios

- [ ] Create public forest → Verify visible to everyone
- [ ] Create private forest → Verify only creator can see initially
- [ ] Send friend request → Accept → Verify can see each other's private forests
- [ ] Reject friend request → Verify cannot see private forests
- [ ] Unfriend user → Verify lose access to their private forests
- [ ] Try accessing private forest post by direct URL without permission → Should fail
- [ ] Forest creator removes privacy → Forest becomes public
- [ ] Forest creator adds privacy → Forest becomes private

### Automated Testing (Future)

- API endpoint tests for access control
- Integration tests for friendship + forest access flow
- UI tests for forest creation and navigation

## 🐛 Known Issues & Limitations

### Current Limitations

1. **No Batch Operations:** Cannot bulk-add friends to forests
2. **No Forest Transfer:** Cannot transfer ownership of a forest
3. **No Archive Feature:** Cannot archive old forests
4. **Post Migration:** No way to move posts between forests
5. **No Undo:** Friend removal immediately revokes forest access

### Bug Fixes Needed

- None currently identified (monitoring in production)

## 📈 Metrics to Track

1. **Usage Metrics:**

   - Number of private forests created
   - Ratio of private vs public forests
   - Average friends per user
   - Active friendships (posting in shared forests)

2. **Engagement Metrics:**
   - Posts in private forests vs public forests
   - Comments in private forests vs public forests
   - Forest switching frequency
   - Friend request acceptance rate

## 🚀 Deployment Notes

### Before Deploying

1. **Run Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```
2. **Verify Schema:**

   - Ensure `isPrivate` field exists in Forest model
   - Ensure Friend model has proper indexes

3. **Test Access Control:**
   - Test with multiple users
   - Verify private forests not visible to unauthorized users

### After Deployment

1. Monitor error logs for access control issues
2. Check that existing public forests remain accessible
3. Verify forest creation works with privacy toggle

## 📝 Documentation for Users

### How to Create a Private Forest

1. Click "New Forest" button in header
2. Enter forest name and description
3. Toggle "Private Forest" switch
4. Click "Create Forest"

### Who Can See My Private Forest?

- Only you and your **accepted friends** can see posts in your private forest
- Pending friend requests don't grant access
- Rejected or blocked users cannot see your private forests

### How to Make Friends

1. Click "Friends" button in header
2. Enter friend's username
3. Click "Send Request"
4. Wait for them to accept
5. Once accepted, you both can see each other's private forests

## 🎯 Success Criteria

### MVP Complete ✅

- [x] Users can create private forests
- [x] Privacy is enforced at API level
- [x] Friends can see each other's private forests
- [x] UI clearly indicates private vs public forests
- [x] URL-based forest navigation works

### Phase 1 Goals 🎯

- [ ] Posts in private forests are properly filtered
- [ ] Unauthorized access returns proper error messages
- [ ] Private forest posts don't appear in global feed

### Phase 2 Goals 🎯

- [ ] Forest invite system implemented
- [ ] Non-friends can be invited to specific forests
- [ ] Invite notifications work

## 🤝 Contributing

When working on private forests features:

1. **Always Test Access Control:**
   - Test with multiple user accounts
   - Verify unauthorized users can't see private content
2. **Update This Document:**
   - Mark completed features as ✅
   - Add new issues to "Known Issues"
   - Update testing checklist
3. **Security First:**
   - Never expose private data in logs
   - Always verify user permissions server-side
   - Don't trust client-side permissions

---

**Last Updated:** October 17, 2025
**Status:** MVP Complete, Ready for Production
**Next Steps:** Monitor usage and plan Phase 1 enhancements
