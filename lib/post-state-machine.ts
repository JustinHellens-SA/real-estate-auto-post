/**
 * Post State Machine - LRE Marketing OS
 * 
 * Manages post lifecycle from DRAFT → AI_GENERATED → APPROVED → SCHEDULED → POSTED
 * Handles state transitions, validation, and history tracking
 */

import { prisma } from './prisma';

// Post status values (SQLite doesn't support enums)
export type PostStatus = 'DRAFT' | 'AI_GENERATED' | 'APPROVED' | 'SCHEDULED' | 'POSTED' | 'FAILED';

interface StateTransition {
  postId: string;
  fromStatus: PostStatus;
  toStatus: PostStatus;
  user?: string;
  note?: string;
}

interface StatusHistoryEntry {
  status: PostStatus;
  timestamp: string;
  user?: string;
  note?: string;
}

/**
 * Transition a post to a new status with validation
 */
export async function transitionPostStatus(
  postId: string,
  newStatus: PostStatus,
  user?: string,
  note?: string
): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }

  const currentStatus = post.status as PostStatus;

  // Validate state transition
  validateTransition(currentStatus, newStatus);

  // Parse existing history
  const history: StatusHistoryEntry[] = post.statusHistory 
    ? JSON.parse(post.statusHistory)
    : [];

  // Add new history entry
  history.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    user,
    note,
  });

  // Update post
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: newStatus,
      statusHistory: JSON.stringify(history),
      // Clear failure reason when moving out of FAILED state
      ...(currentStatus === 'FAILED' && newStatus !== 'FAILED' ? { failureReason: null } : {}),
    },
  });
}

/**
 * Validate that a state transition is allowed
 */
function validateTransition(from: PostStatus, to: PostStatus): void {
  const allowedTransitions: Record<PostStatus, PostStatus[]> = {
    DRAFT: ['AI_GENERATED', 'FAILED'],
    AI_GENERATED: ['APPROVED', 'DRAFT', 'FAILED'],
    APPROVED: ['SCHEDULED', 'POSTED', 'DRAFT', 'FAILED'],
    SCHEDULED: ['POSTED', 'DRAFT', 'FAILED'],
    POSTED: [], // Terminal state (can only go to FAILED if post is deleted)
    FAILED: ['DRAFT', 'AI_GENERATED', 'APPROVED', 'SCHEDULED'], // Can retry from any previous state
  };

  const allowed = allowedTransitions[from];
  
  if (!allowed.includes(to)) {
    throw new Error(
      `Invalid state transition: ${from} → ${to}. Allowed: ${allowed.join(', ')}`
    );
  }
}

/**
 * Mark a post as failed with a reason
 */
export async function markPostFailed(
  postId: string,
  failureReason: string,
  user?: string
): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: 'FAILED',
      failureReason,
      retryCount: post.retryCount + 1,
    },
  });

  await transitionPostStatus(postId, 'FAILED', user, `Failure: ${failureReason}`);
}

/**
 * Get posts by status (useful for queue processing)
 */
export async function getPostsByStatus(status: PostStatus) {
  return prisma.post.findMany({
    where: { status },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          tonePreference: true,
          emojiLevel: true,
          hashtagPack: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get scheduled posts that are ready to be posted
 */
export async function getPostsReadyToPost() {
  const now = new Date();
  
  return prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      agent: true,
    },
    orderBy: { scheduledFor: 'asc' },
  });
}

/**
 * Auto-transition workflow helpers
 */
export const PostWorkflow = {
  /**
   * Move from DRAFT to AI_GENERATED after captions are created
   */
  async markAIGenerated(postId: string): Promise<void> {
    await transitionPostStatus(postId, 'AI_GENERATED', 'system', 'AI captions generated');
  },

  /**
   * Approve a post for posting (by agent or admin)
   */
  async approve(postId: string, approvedBy: string): Promise<void> {
    await transitionPostStatus(postId, 'APPROVED', approvedBy, 'Post approved');
  },

  /**
   * Schedule a post for future posting
   */
  async schedule(postId: string, scheduledFor: Date, scheduledBy: string): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: { scheduledFor },
    });
    await transitionPostStatus(postId, 'SCHEDULED', scheduledBy, `Scheduled for ${scheduledFor.toISOString()}`);
  },

  /**
   * Mark as posted successfully
   */
  async markPosted(
    postId: string,
    metaPostId?: string,
    facebookPostId?: string,
    instagramPostId?: string
  ): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        postedAt: new Date(),
        metaPostId,
        facebookPostId,
        instagramPostId,
      },
    });
    await transitionPostStatus(postId, 'POSTED', 'system', 'Successfully posted to Meta');
  },

  /**
   * Retry a failed post
   */
  async retry(postId: string, retryBy: string): Promise<void> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    
    if (!post || post.status !== 'FAILED') {
      throw new Error('Can only retry posts in FAILED status');
    }

    // Determine what state to return to based on history
    const history: StatusHistoryEntry[] = post.statusHistory 
      ? JSON.parse(post.statusHistory)
      : [];
    
    // Get the last non-FAILED status
    const lastGoodState = history
      .slice()
      .reverse()
      .find((entry) => entry.status !== 'FAILED');
    
    const targetStatus = (lastGoodState?.status as PostStatus) || 'DRAFT';

    await transitionPostStatus(postId, targetStatus, retryBy, 'Retrying after failure');
  },
};

/**
 * Get post status history for audit trail
 */
export async function getPostHistory(postId: string): Promise<StatusHistoryEntry[]> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { statusHistory: true },
  });

  if (!post || !post.statusHistory) {
    return [];
  }

  return JSON.parse(post.statusHistory);
}

/**
 * Get post statistics by status
 */
export async function getPostStatistics() {
  const statusCounts = await prisma.post.groupBy({
    by: ['status'],
    _count: true,
  });

  const stats: Record<string, number> = {};
  statusCounts.forEach((item) => {
    stats[item.status] = item._count;
  });

  return {
    total: await prisma.post.count(),
    byStatus: stats,
    failureRate: stats.FAILED ? (stats.FAILED / (await prisma.post.count())) * 100 : 0,
  };
}
