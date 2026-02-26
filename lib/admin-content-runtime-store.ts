export interface AdminHomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
}

export interface AdminSponsorBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'homepage_top' | 'homepage_sidebar' | 'contestant_profile';
  active: boolean;
}

export interface AdminHomepageSlider {
  id: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  order: number;
  active: boolean;
}

export interface AdminNavigationMenuItem {
  id: string;
  label: string;
  href: string;
  position: 'header' | 'mobile';
  order: number;
  visible: boolean;
}

export interface AdminFooterLink {
  id: string;
  label: string;
  href: string;
  group: 'Platform' | 'Company' | 'Legal' | 'Social';
  order: number;
  visible: boolean;
}

export interface AdminContentState {
  homepage: AdminHomepageContent;
  sponsorBanners: AdminSponsorBanner[];
  homepageSliders: AdminHomepageSlider[];
  navigationMenus: AdminNavigationMenuItem[];
  footerLinks: AdminFooterLink[];
  updatedAt: string;
}

let contentState: AdminContentState = {
  homepage: {
    heroTitle: 'Where Influence Meets Integrity.',
    heroSubtitle:
      'Africa’s most trusted voting & sponsorship platform built for transparent scale, enterprise compliance, and real-time engagement.',
    announcement: 'Trusted Public Voting Platform',
    primaryCtaLabel: 'Vote Now',
    primaryCtaUrl: '/events',
  },
  sponsorBanners: [
    {
      id: 'banner-1',
      title: 'Castaway Collective',
      imageUrl:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&h=500&fit=crop',
      targetUrl: '/sponsors',
      placement: 'homepage_top',
      active: true,
    },
    {
      id: 'banner-2',
      title: 'Swift Scale Media',
      imageUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=500&fit=crop',
      targetUrl: '/sponsors',
      placement: 'homepage_top',
      active: true,
    },
  ],
  homepageSliders: [
    {
      id: 'slider-1',
      headline: 'Live Voting Events',
      subheadline: 'Track momentum in real time and vote with transparent integrity checks.',
      imageUrl:
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=2000&h=1200&fit=crop',
      ctaLabel: 'View All Events',
      ctaUrl: '/events',
      order: 1,
      active: true,
    },
    {
      id: 'slider-2',
      headline: 'Upcoming Events',
      subheadline: 'Discover what launches next and set your reminders early.',
      imageUrl:
        'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1600&h=900&fit=crop',
      ctaLabel: 'Discover Events',
      ctaUrl: '/events',
      order: 2,
      active: true,
    },
  ],
  navigationMenus: [
    { id: 'nav-1', label: 'Events', href: '/events', position: 'header', order: 1, visible: true },
    { id: 'nav-2', label: 'Live Leaderboard', href: '/events', position: 'header', order: 2, visible: true },
    { id: 'nav-3', label: 'Sponsors', href: '/sponsors', position: 'header', order: 3, visible: true },
    { id: 'nav-4', label: 'How It Works', href: '/how-it-works', position: 'header', order: 4, visible: true },
    { id: 'nav-5', label: 'Archive', href: '/events/archive', position: 'header', order: 5, visible: true },
    { id: 'nav-6', label: 'About', href: '/how-it-works', position: 'header', order: 6, visible: true },
  ],
  footerLinks: [
    { id: 'footer-1', label: 'Events', href: '/events', group: 'Platform', order: 1, visible: true },
    { id: 'footer-2', label: 'Leaderboard', href: '/events', group: 'Platform', order: 2, visible: true },
    { id: 'footer-3', label: 'Sponsors', href: '/sponsors', group: 'Platform', order: 3, visible: true },
    { id: 'footer-4', label: 'Archive', href: '/events/archive', group: 'Platform', order: 4, visible: true },
    { id: 'footer-5', label: 'About', href: '/how-it-works', group: 'Company', order: 1, visible: true },
    { id: 'footer-6', label: 'Careers', href: '/events', group: 'Company', order: 2, visible: true },
    { id: 'footer-7', label: 'Press', href: '/events', group: 'Company', order: 3, visible: true },
    { id: 'footer-8', label: 'Contact', href: '/notifications', group: 'Company', order: 4, visible: true },
    { id: 'footer-9', label: 'Terms', href: '/terms', group: 'Legal', order: 1, visible: true },
    { id: 'footer-10', label: 'Privacy', href: '/privacy', group: 'Legal', order: 2, visible: true },
    { id: 'footer-11', label: 'Anti-Fraud Policy', href: '/events', group: 'Legal', order: 3, visible: true },
    { id: 'footer-12', label: 'Sponsorship Guidelines', href: '/events', group: 'Legal', order: 4, visible: true },
    { id: 'footer-13', label: 'Compliance', href: '/events', group: 'Legal', order: 5, visible: true },
    { id: 'footer-14', label: 'Instagram', href: 'https://instagram.com', group: 'Social', order: 1, visible: true },
    { id: 'footer-15', label: 'TikTok', href: 'https://tiktok.com', group: 'Social', order: 2, visible: true },
    { id: 'footer-16', label: 'YouTube', href: 'https://youtube.com', group: 'Social', order: 3, visible: true },
    { id: 'footer-17', label: 'Twitter', href: 'https://x.com', group: 'Social', order: 4, visible: true },
  ],
  updatedAt: new Date().toISOString(),
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAdminContentState(): AdminContentState {
  return structuredClone(contentState);
}

export function patchAdminContentState(payload: Partial<AdminContentState>): AdminContentState {
  contentState = {
    ...contentState,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return structuredClone(contentState);
}

export function createAdminSponsorBanner(
  payload: Omit<AdminSponsorBanner, 'id'>
): AdminContentState {
  contentState.sponsorBanners = [
    { id: createId('banner'), ...payload },
    ...contentState.sponsorBanners,
  ];
  contentState.updatedAt = new Date().toISOString();
  return structuredClone(contentState);
}

export function createAdminHomepageSlider(
  payload: Omit<AdminHomepageSlider, 'id'>
): AdminContentState {
  contentState.homepageSliders = [
    { id: createId('slider'), ...payload },
    ...contentState.homepageSliders,
  ];
  contentState.updatedAt = new Date().toISOString();
  return structuredClone(contentState);
}

export function createAdminNavigationMenuItem(
  payload: Omit<AdminNavigationMenuItem, 'id'>
): AdminContentState {
  contentState.navigationMenus = [
    { id: createId('nav'), ...payload },
    ...contentState.navigationMenus,
  ];
  contentState.updatedAt = new Date().toISOString();
  return structuredClone(contentState);
}

export function createAdminFooterLink(
  payload: Omit<AdminFooterLink, 'id'>
): AdminContentState {
  contentState.footerLinks = [
    { id: createId('footer'), ...payload },
    ...contentState.footerLinks,
  ];
  contentState.updatedAt = new Date().toISOString();
  return structuredClone(contentState);
}
