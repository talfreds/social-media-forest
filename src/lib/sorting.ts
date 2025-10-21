// Centralized sorting utilities for consistent behavior across the app

export interface SortableItem {
  createdAt: string | Date;
  _count?: {
    posts?: number;
    comments?: number;
  };
}

/**
 * Sort items by post count (descending), then by creation date (ascending as tiebreaker)
 * This is the primary sorting method used for forests and posts
 */
export function sortByActivityAndAge<T extends SortableItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Primary sort: by post count (most active first)
    const aPostCount = a._count?.posts || 0;
    const bPostCount = b._count?.posts || 0;

    if (bPostCount !== aPostCount) {
      return bPostCount - aPostCount;
    }

    // Tiebreaker: by creation date (oldest first)
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return aDate - bDate;
  });
}

/**
 * Sort items by creation date (newest first)
 * Used for comments and other time-sensitive content
 */
export function sortByNewest<T extends SortableItem>(items: T[]): T[] {
  return items.sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return bDate - aDate;
  });
}

/**
 * Sort items by creation date (oldest first)
 * Used for chronological ordering
 */
export function sortByOldest<T extends SortableItem>(items: T[]): T[] {
  return items.sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return aDate - bDate;
  });
}
