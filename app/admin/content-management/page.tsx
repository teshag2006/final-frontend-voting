import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: 'Homepage',
    description: 'Edit hero title, subtitle, announcement, and primary CTA.',
    href: '/admin/content-management/homepage',
  },
  {
    title: 'Sponsor Banners',
    description: 'Insert, edit, reorder, and remove homepage sponsor banners.',
    href: '/admin/content-management/banners',
  },
  {
    title: 'Homepage Sliders',
    description: 'Manage slider headlines, images, CTA labels, CTA URLs, and order.',
    href: '/admin/content-management/sliders',
  },
  {
    title: 'Navigation Menus',
    description: 'Manage header/mobile menu labels, links, visibility, and ordering.',
    href: '/admin/content-management/navigation',
  },
  {
    title: 'Footer Links',
    description: 'Manage footer groups (Platform, Company, Legal, Social) and ordering.',
    href: '/admin/content-management/footer',
  },
];

export default function ContentManagementOverviewPage() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => (
        <Link key={section.href} href={section.href}>
          <Card className="h-full border-slate-200 transition hover:border-slate-300 hover:shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{section.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}

