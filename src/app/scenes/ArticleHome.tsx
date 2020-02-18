import React from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import differenceInHours from 'date-fns/differenceInHours';

import { RidiSelectState } from 'app/store';
import { HelmetWithTitle } from 'app/components';
import { FetchStatusFlag, PageTitleText } from 'app/constants';
import { ConnectedBigBannerCarousel } from 'app/components/Home/BigBanner';
import { Actions, ArticleHomeSectionType } from 'app/services/articleHome';
import { sendPostRobotInitialRendered } from 'app/utils/inAppMessageEvents';
import { Actions as ArticleFollowingActions } from 'app/services/articleFollowing';
import { ArticleHomeListSection } from 'app/components/ArticleHome/ArticleHomeListSection';
import { ArticleHomeChartSection } from 'app/components/ArticleHome/ArticleHomeChartSection';

const ArticleHome: React.FunctionComponent = () => {
  const { fetchedAt, hasAvailableTicket, unseenFeedsFetchStatus } = useSelector(
    (state: RidiSelectState) => ({
      fetchedAt: state.articleHome.fetchedAt,
      hasAvailableTicket: state.user.hasAvailableTicket,
      unseenFeedsFetchStatus: state.articleFollowing.unseenFeedsFetchStatus,
    }),
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!fetchedAt || Math.abs(differenceInHours(fetchedAt, Date.now())) >= 3) {
      dispatch(Actions.loadArticleBannerRequest());
    }
    sendPostRobotInitialRendered();
  }, []);

  React.useEffect(() => {
    if (hasAvailableTicket && unseenFeedsFetchStatus !== FetchStatusFlag.FETCHING) {
      dispatch(ArticleFollowingActions.loadUnseenFollowingFeedsRequest());
    }
  }, [hasAvailableTicket]);

  return (
    <main
      className={classNames(
        'PageHome',
        'SceneWrapper',
        'SceneWrapper_WithGNB',
        'SceneWrapper_WithLNB',
      )}
    >
      <HelmetWithTitle titleName={PageTitleText.ARTICLE_HOME} />
      <div className="a11y">
        <h1>리디셀렉트 아티클 홈</h1>
      </div>
      <ConnectedBigBannerCarousel />
      <div className="ArticleHome_Panel">
        <ArticleHomeListSection
          title="최근 추가된 아티클"
          articleHomeSectionType={ArticleHomeSectionType.RECENT}
          order={0}
        />
      </div>
      <div className="ArticleHome_Panel">
        <ArticleHomeChartSection
          title="인기 아티클"
          articleHomeSectionType={ArticleHomeSectionType.POPULAR}
          order={1}
        />
      </div>
      <div className="ArticleHome_Panel">
        <ArticleHomeListSection
          title="추천 아티클"
          articleHomeSectionType={ArticleHomeSectionType.RECOMMEND}
          order={2}
        />
      </div>
    </main>
  );
};

export default ArticleHome;
