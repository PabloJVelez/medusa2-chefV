import { convertToFormData } from '@libs/util/forms/objectToFormData';
import { useFetcher } from '@remix-run/react';
import { Container } from '@app/components/common/container/Container';
import { Select } from '@app/components/common/forms/inputs/Select';
import { URLAwareNavLink } from '@app/components/common/link/URLAwareNavLink';
import { useRegion } from '@app/hooks/useRegion';
import { useRegions } from '@app/hooks/useRegions';
import { useRootLoaderData } from '@app/hooks/useRootLoaderData';
import { useSiteDetails } from '@app/hooks/useSiteDetails';
import clsx from 'clsx';
import { useMemo } from 'react';
import { LogoStoreName } from '@app/components/LogoStoreName/LogoStoreName';
import { NewsletterSubscription } from '@app/components/newsletter/Newsletter';
import { RegionActions } from '@app/routes/api.region';
import { StripeSecurityImage } from '../../images/StripeSecurityImage';
import { SocialIcons } from './SocialIcons';

export const Footer = () => {
  const { footerNavigationItems, settings } = useSiteDetails();
  const rootData = useRootLoaderData();
  const hasProducts = rootData?.hasPublishedProducts;
  const fetcher = useFetcher();
  const { regions } = useRegions();
  const { region } = useRegion();

  const regionOptions = useMemo(() => {
    return regions.map((region) => ({
      label: `${region.name} (${region.currency_code})`,
      value: region.id,
    }));
  }, [regions]);

  const onRegionChange = (regionId: string) => {
    fetcher.submit(
      convertToFormData({
        regionId,
        subaction: RegionActions.CHANGE_REGION,
      }),
      { method: 'post', action: '/api/region' },
    );
  };

  return (
    <footer className="bg-accent-50 min-h-[140px] py-8 text-white">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-5">
              <SocialIcons siteSettings={settings} />
            </div>
            {hasProducts && <StripeSecurityImage />}
          </div>

          <div className="flex justify-center border-t border-white/10 pt-8">
            <a
              href="https://www.linkedin.com/in/pablo-velez" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm"
            >
              © {new Date().getFullYear()} Made with ❤️ by Pablo Velez
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
