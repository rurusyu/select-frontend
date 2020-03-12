import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';

import { RidiSelectState } from 'app/store';
import { AppStatus } from 'app/services/app';
import TopBannerCarousel, { IMAGE_WIDTH } from 'app/components/TopBanner';
import { getSectionStringForTracking } from 'app/services/tracking/utils';

const TopBannerSkeleton = styled.div`
  width: 100%;
  height: 100vw;
  max-height: ${IMAGE_WIDTH}px;
  background: #eee;
`;

const BigBanner: React.FunctionComponent = () => {
  const { appStatus } = useSelector((state: RidiSelectState) => state.app);
  const fetchedAt = useSelector((state: RidiSelectState) =>
    appStatus === AppStatus.Books ? state.home.fetchedAt : state.articleHome.fetchedAt,
  );
  const bigBannerList = useSelector((state: RidiSelectState) =>
    appStatus === AppStatus.Books ? state.home.bigBannerList : state.articleHome.bigBannerList,
  );
  const service = appStatus === AppStatus.Books ? 'select-book' : 'select-article';
  const section = getSectionStringForTracking(service, 'home', 'big-banner');
  const banners = bigBannerList.map(bannerItem => ({
    id: bannerItem.id,
    landing_url: bannerItem.linkUrl,
    main_image_url: bannerItem.imageUrl,
    title: bannerItem.title,
  }));

  return fetchedAt ? (
    <TopBannerCarousel banners={banners} section={section} />
  ) : (
    <TopBannerSkeleton />
  );
};

export default BigBanner;
