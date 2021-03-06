import React from 'react';
import { Method } from 'axios';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import toast from 'app/utils/toast';
import SlideArrow from 'app/components/SlideArrow';
import { articleChannelToPath } from 'app/utils/toPath';
import { Actions } from 'app/services/articleFollowing';
import { useScrollSlider } from 'app/hooks/useScrollSlider';
import { ArticleChannel } from 'app/services/articleChannel';
import { BlockIconComponent } from 'app/components/ArticleThumbnail';
import { getSectionStringForTracking } from 'app/services/tracking/utils';
import { ConnectedTrackImpression } from 'app/components/TrackImpression';
import { Actions as TrackingActions, DefaultTrackingParams } from 'app/services/tracking';
import { ArticleChannelThumbnail } from 'app/components/ArticleChannels/ArticleChannelThumbnail';

interface SlideChannelListProps {
  channels: ArticleChannel[];
}

export const SlideChannelList: React.FunctionComponent<SlideChannelListProps> = props => {
  const ref = React.useRef<HTMLUListElement>(null);
  const [moveLeft, moveRight, isOnTheLeft, isOnTheRight] = useScrollSlider(ref, true);

  const { channels } = props;
  const dispatch = useDispatch();
  const section = getSectionStringForTracking('select-article', 'following', 'channel-list');
  const handleBlockChannelClick = (channelId: number, channelName: string) => {
    const method: Method = 'DELETE';
    const toastButton = {
      callback: () => {
        dispatch(Actions.loadUnFollowChannelRequest({ channelId, channelName, method }));
      },
      label: '팔로잉 취소',
    };
    toast.failureMessage('이용할 수 없는 채널입니다. 팔로잉을 취소하시겠습니까?', {
      button: {
        showArrowIcon: true,
        ...toastButton,
      },
    });
  };

  const trackingClick = (index: number, id: string) => {
    if (!section) {
      return;
    }

    const trackingParams: DefaultTrackingParams = {
      section,
      index,
      id,
    };
    dispatch(TrackingActions.trackClick({ trackingParams }));
  };

  return (
    <section className="FollowingChannel_ListWrap">
      <ul className="FollowingChannel_List scrollBarHidden" ref={ref}>
        {channels.map((channel, idx) => (
          <li key={idx} className="FollowingChannel_Item">
            <ConnectedTrackImpression section={section} index={idx} id={`ch:${channel.id}`}>
              <div className="FollowingChannel_Item_InnerWrapper">
                {channel.isEnabled ? (
                  <>
                    <ArticleChannelThumbnail
                      imageUrl={channel.thumbnailUrl}
                      channelName={channel.displayName}
                      linkUrl={articleChannelToPath({ channelName: channel.name })}
                      onLinkClick={() => trackingClick(idx, `ch:${channel.id}`)}
                    />
                    <Link
                      to={articleChannelToPath({ channelName: channel.name })}
                      className="FollowingChannel_Item_Link"
                      onClick={() => trackingClick(idx, `ch:${channel.id}`)}
                    >
                      {channel.displayName}
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ArticleFollowing_BlockButton"
                      onClick={() => handleBlockChannelClick(channel.id, channel.name)}
                    >
                      <BlockIconComponent
                        width={24}
                        height={24}
                        className="ArticleFollowing_BlockIcon"
                      />
                    </button>
                    <div className="FollowingChannel_Block_Title">{channel.displayName}</div>
                  </>
                )}
              </div>
            </ConnectedTrackImpression>
          </li>
        ))}
      </ul>
      <SlideArrow
        label="이전"
        side="left"
        renderGradient
        onClickHandler={moveLeft}
        isHidden={!isOnTheLeft}
      />
      <SlideArrow
        label="다음"
        side="right"
        renderGradient
        onClickHandler={moveRight}
        isHidden={!isOnTheRight}
      />
    </section>
  );
};
