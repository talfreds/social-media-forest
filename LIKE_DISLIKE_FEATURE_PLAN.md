# Like/Dislike Feature Plan - Forest Theme

## Overview

Implement a themed voting system for trees (posts) and branches (comments) with a focus on maintaining content (text/images) as primary, with votes as subtle secondary indicators.

## Theme: Nurture vs. Prune

- **Like (Nurture)**: 🌱 Seedling/Sprout icon - represents growth and support
- **Dislike (Prune)**: ✂️ Pruning shears icon - represents necessary trimming

### Alternative Themes Considered:

1. **Hug vs. Axe**: Too violent (axe) for the gentle forest theme
2. **Sun vs. Cloud**: Too weather-focused
3. **Water vs. Drought**: Less intuitive

## Database Schema

### Add to `schema.prisma`:

```prisma
model PostVote {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  value     Int      // 1 for like, -1 for dislike
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

model CommentVote {
  id        String   @id @default(cuid())
  commentId String
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  value     Int      // 1 for like, -1 for dislike
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([commentId, userId])
  @@index([commentId])
  @@index([userId])
}

// Add to Post model:
votes     PostVote[]

// Add to Comment model:
votes     CommentVote[]

// Add to User model:
postVotes    PostVote[]
commentVotes CommentVote[]
```

## API Endpoints

### 1. `/api/posts/[id]/vote.ts`

```typescript
POST /api/posts/:id/vote
Body: { value: 1 | -1 }
Response: {
  likes: number,
  dislikes: number,
  userVote: 1 | -1 | null,
  netScore: number
}
```

### 2. `/api/comments/[id]/vote.ts`

```typescript
POST /api/comments/:id/vote
Body: { value: 1 | -1 }
Response: {
  likes: number,
  dislikes: number,
  userVote: 1 | -1 | null,
  netScore: number
}
```

## UI Design

### Visual Hierarchy:

1. **Primary**: User content (text & images) - large, prominent
2. **Secondary**: Vote indicators - small, subtle, bottom-right corner
3. **Tertiary**: User info, timestamps - minimal

### Vote Display Components:

#### Compact Mode (Default):

```
┌─────────────────────────────┐
│ [Avatar] User Name          │
│                             │
│ Post/Comment content here   │
│ with images if any          │
│                             │
│                   🌱 12 ✂️ 3│ ← Small, subtle
└─────────────────────────────┘
```

#### Expanded Mode (On Hover):

```
┌─────────────────────────────┐
│ [Avatar] User Name          │
│                             │
│ Post/Comment content here   │
│                             │
│        [🌱 Nurture] [✂️ Prune]│ ← Clickable buttons
│          12 likes   3 cuts  │
└─────────────────────────────┘
```

### Vote Button States:

1. **Not voted**: Gray icons, translucent
2. **Voted Like**: Green 🌱 (highlighted), other grayed out
3. **Voted Dislike**: Brown/orange ✂️ (highlighted), other grayed out

### Net Score Indicator:

- **Positive (+8 or more)**: 🌳 Thriving Tree - subtle green glow
- **Neutral (-7 to +7)**: 🌿 Growing - neutral
- **Negative (-8 or less)**: 🥀 Wilting - subtle brown/fade

## Implementation Steps

### Phase 1: Database & API (2-3 hours)

1. Update Prisma schema with vote models
2. Run `npx prisma db push`
3. Create vote API endpoints
4. Add vote aggregation logic

### Phase 2: UI Components (3-4 hours)

1. Create `VoteButton` component
2. Create `VoteDisplay` component
3. Add icons (use MUI icons or custom SVGs)
4. Implement hover states and animations

### Phase 3: Integration (2-3 hours)

1. Add voting to `TreePost` component
2. Add voting to `NestedComment` component
3. Fetch vote counts with posts/comments
4. Implement optimistic UI updates

### Phase 4: Polish (1-2 hours)

1. Add smooth transitions
2. Implement vote count animations
3. Add tooltips ("Nurture this tree", "Prune this branch")
4. Test responsiveness

## Technical Considerations

### Vote Mechanics:

- Users can change their vote (click opposite to switch)
- Clicking same vote twice removes the vote
- Votes are tied to user accounts (no anonymous voting)
- Vote counts update in real-time (optimistic UI)

### Performance:

- Aggregate vote counts cached in response
- Debounce vote API calls (300ms)
- Use optimistic updates for instant feedback

### Rate Limiting:

- Max 100 votes per user per hour
- Prevent vote spamming on single item

## Mobile Considerations

### Touch Targets:

- Vote buttons minimum 44x44px
- Larger spacing between like/dislike on mobile
- Swipe gestures (optional future enhancement)

## Accessibility

### Requirements:

- ARIA labels for vote buttons
- Keyboard navigation support
- Screen reader friendly vote counts
- High contrast mode support

## Future Enhancements

### Phase 2 Features (Future):

1. **Vote history**: See who voted on your content
2. **Trending algorithm**: Surface highly-voted content
3. **Vote notifications**: "Your tree is thriving! (+50 nurtures)"
4. **Vote leaderboard**: Most nurtured trees/branches
5. **Vote-based badges**: "Nurturing Gardener", "Thoughtful Pruner"

## Estimated Total Time: 8-12 hours

## Success Metrics

- Vote engagement rate > 10% of users
- Average votes per post/comment > 2
- Vote change rate < 5% (indicates thoughtful voting)
- No abuse reports related to voting

## Notes

- Keep votes subtle - content is primary, votes are secondary
- Green theme consistent with forest aesthetic
- Simple, intuitive icons
- Fast, responsive interactions
