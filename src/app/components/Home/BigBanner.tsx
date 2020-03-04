import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';

import { RidiSelectState } from 'app/store';
import { AppStatus } from 'app/services/app';
import { selectIsInApp } from 'app/services/environment/selectors';
import TopBannerCarousel, { IMAGE_WIDTH } from 'app/components/TopBanner';

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
  const isInApp = useSelector(selectIsInApp);
  const banners = bigBannerList.map(bannerItem => ({
    landing_url: bannerItem.linkUrl,
    main_image_url: bannerItem.imageUrl,
    title: bannerItem.title,
  }));

  return fetchedAt ? <TopBannerCarousel banners={banners} /> : <TopBannerSkeleton />;
};

export default BigBanner;
