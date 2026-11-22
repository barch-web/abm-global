import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import WhatsAppAndCallBar from './WhatsAppAndCallBar';
import type { SiteContentData, SocialLinkItem } from '@/lib/types';

interface PublicShellProps {
  children: ReactNode;
  siteContent: SiteContentData;
  socialLinks: SocialLinkItem[];
}

export default function PublicShell({
  children,
  siteContent,
  socialLinks,
}: PublicShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0B1F3A]">
      <SiteHeader companyName={siteContent.companyName} />
      <main className="flex-1">{children}</main>
      <SiteFooter siteContent={siteContent} socialLinks={socialLinks} />
      <WhatsAppAndCallBar
        whatsappIntl={siteContent.whatsappNumberIntl}
        phoneDisplay={siteContent.contactPhoneDisplay}
        phoneTel={siteContent.contactPhoneTel}
      />
    </div>
  );
}
