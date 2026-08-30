import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout {...baseOptions()} className="min-h-screen">
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
