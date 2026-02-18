/**
 * Announcement Service - Manage admin announcements and system banners
 */

export type AnnouncementType = 'info' | 'warning' | 'error' | 'success' | 'maintenance';
export type AnnouncementTargetRole = 'all' | 'admin' | 'contestant' | 'media' | 'voter';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  targetRoles: AnnouncementTargetRole[];
  startDate: string;
  endDate: string;
  priority: number; // 0 (low) to 100 (critical)
  isDismissible: boolean;
  link?: {
    text: string;
    url: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock announcements database
let announcements: Announcement[] = [
  {
    id: 'ann_001',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM EST. The platform will be offline during this time.',
    type: 'warning',
    targetRoles: ['all'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 80,
    isDismissible: false,
    createdBy: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann_002',
    title: 'New Feature: Free Votes',
    message: 'Starting today, all voters get 5 free votes per event!',
    type: 'success',
    targetRoles: ['voter'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 50,
    isDismissible: true,
    link: {
      text: 'Learn More',
      url: '/features/free-votes',
    },
    createdBy: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AnnouncementService {
  /**
   * Get active announcements for a user role
   */
  getActiveAnnouncements(userRole: AnnouncementTargetRole): Announcement[] {
    const now = new Date();
    
    return announcements.filter((ann) => {
      const startDate = new Date(ann.startDate);
      const endDate = new Date(ann.endDate);
      
      // Check if announcement is active
      if (startDate > now || endDate < now) {
        return false;
      }
      
      // Check if user role matches
      if (ann.targetRoles.includes('all') || ann.targetRoles.includes(userRole)) {
        return true;
      }
      
      return false;
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get single announcement
   */
  getAnnouncement(id: string): Announcement | null {
    return announcements.find((ann) => ann.id === id) || null;
  }

  /**
   * Create announcement (admin only)
   */
  createAnnouncement(
    title: string,
    message: string,
    type: AnnouncementType,
    options?: {
      targetRoles?: AnnouncementTargetRole[];
      startDate?: string;
      endDate?: string;
      priority?: number;
      isDismissible?: boolean;
      link?: { text: string; url: string };
      createdBy?: string;
    }
  ): Announcement {
    const announcement: Announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      targetRoles: options?.targetRoles || ['all'],
      startDate: options?.startDate || new Date().toISOString(),
      endDate: options?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: options?.priority || 50,
      isDismissible: options?.isDismissible !== false,
      link: options?.link,
      createdBy: options?.createdBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    announcements.push(announcement);
    return announcement;
  }

  /**
   * Update announcement (admin only)
   */
  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const index = announcements.findIndex((ann) => ann.id === id);
    if (index === -1) return null;

    announcements[index] = {
      ...announcements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return announcements[index];
  }

  /**
   * Delete announcement (admin only)
   */
  deleteAnnouncement(id: string): boolean {
    const index = announcements.findIndex((ann) => ann.id === id);
    if (index === -1) return false;

    announcements.splice(index, 1);
    return true;
  }

  /**
   * Get all announcements (admin only)
   */
  getAllAnnouncements(): Announcement[] {
    return announcements;
  }

  /**
   * Get critical announcements (priority > 70)
   */
  getCriticalAnnouncements(userRole: AnnouncementTargetRole): Announcement[] {
    return this.getActiveAnnouncements(userRole).filter((ann) => ann.priority > 70);
  }
}

export const announcementService = new AnnouncementService();
