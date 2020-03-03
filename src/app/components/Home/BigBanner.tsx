import React from 'react';
import { useSelector } from 'react-redux';

import { RidiSelectState } from 'app/store';
import { AppStatus } from 'app/services/app';
import { selectIsInApp } from 'app/services/environment/selectors';
import TopBannerCarousel from 'app/components/TopBanner';

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

  if (!fetchedAt) {
    return null;
  }

  return <TopBannerCarousel banners={banners} />;
};

export default BigBanner;
