import styled from '@emotion/styled';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

import BigBannerCarousel from 'app/components/BigBannerCarousel';
import ArrowRight from 'svgs/ArrowHeadRight.svg';
import ArrowLeft from 'svgs/ArrowHeadLeft.svg';

const DESKTOP_INACTIVE_SCALE = 1;
const ITEM_MARGIN = 0;

const IMAGE_WIDTH = 432;
const MD_IMAGE_WIDTH = 355;

const SLIDE_RADIUS = 1;
const SCROLL_DURATION = 5000;

const CarouselWrapper = styled.div<{ itemWidth: number; inactiveScale: number }>`
  width: 100%;
  max-width: ${props =>
    props.itemWidth * (props.inactiveScale * (SLIDE_RADIUS + 1) * 2 + 1) +
    ITEM_MARGIN * (SLIDE_RADIUS + 1) * 2}px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const CarouselControllerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;
`;

const CarouselController = styled.div<{ itemWidth: number }>`
  position: relative;
  width: ${props => props.itemWidth}px;
  height: ${props => props.itemWidth}px;
`;

const SlideBadge = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 54px;
  height: 24px;

  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;

  font-size: 12px;
  line-height: 22px;
  text-align: center;
  color: white;
`;

const BannerImageLink = styled.a`
  width: 100%;
  height: 100%;

  display: inline-block;
  outline: none;
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: 0 0;
`;

interface CarouselItemContainerProps {
  imageWidth: number;
  imageHeight: number;
  inactiveScale: number;
  active?: boolean;
  invisible?: boolean;
}

const CarouselItemContainer = styled.li<CarouselItemContainerProps>`
  flex: none;
  position: relative;
  width: ${props => props.imageWidth * (props.active ? 1 : props.inactiveScale)}px;
  height: ${props => props.imageHeight * (props.active ? 1 : props.inactiveScale)}px;

  overflow: hidden;
  line-height: 0;
  transition: width 0.2s, height 0.2s, box-shadow 0.2s, opacity 0.2s;
  opacity: ${props => (props.invisible ? 0 : 1)};

  &:focus-within {
    box-shadow: 0 0.8px 3px rgba(0, 0, 0, 0.33);
  }

  & ::before {
    display: block;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    transition: background-color 0.2s;
    background-color: rgba(26, 26, 26, ${props => (props.active ? 0 : 0.5)});

    pointer-events: none;
  }
`;

const ArrowWrapper = styled.div`
  margin: 0 10px;

  pointer-events: auto;
`;

const Arrow = styled.button`
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  border: solid 1px rgba(0, 0, 0, 0.07);
  background-color: rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s;

  .ControllArrow {
    width: 8px;
    height: 13px;
    fill: white;
  }

  :hover,
  :focus {
    background-color: rgba(209, 213, 217, 0.25);
  }
  @media (hover: none) {
    :hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
`;

function calcItemWidth(isDesktop: boolean, isMobile: boolean) {
  if (isDesktop) {
    return IMAGE_WIDTH;
  }
  if (isMobile) {
    return IMAGE_WIDTH;
  }
  return null;
}

/**
 * 고리 형태의 리스트에서 idx가 [start, end] 사이에 있는지 확인합니다.
 *
 * @argument start - 시작점
 * @argument end - 끝점
 * @argument idx - 확인할 인덱스
 */
function checkWithinRingRange(start: number, end: number, idx: number): boolean {
  // start <= end일 때: [... len-1, 0 ... start ... end ... len-1, 0 ...]
  // idx가 start와 end 사이에 있는지 확인하면 됩니다.
  if (start <= end) {
    return start <= idx && idx <= end;
  }
  // end < start일 때: [... start ... len-1, 0, ... end ...]
  // idx가 start 이상이거나 end 이하인지 확인하면 됩니다.
  return idx <= end || start <= idx;
}

interface TopBanner {
  landing_url: string;
  title: string;
  main_image_url: string;
}

interface CarouselItemProps {
  itemWidth: number;
  inactiveScale: number;
  banner: TopBanner;
  active: boolean;
  invisible: boolean;
}

function CarouselItem(props: CarouselItemProps) {
  const { itemWidth, inactiveScale, banner, active, invisible } = props;
  // const [intersecting, setIntersecting] = React.useState(false);
  // const ref = useViewportIntersection<HTMLLIElement>(setIntersecting);
  return (
    <CarouselItemContainer
      imageWidth={itemWidth}
      imageHeight={itemWidth}
      inactiveScale={inactiveScale}
      active={active}
      invisible={invisible}
    >
      <BannerImageLink href={banner.landing_url} tabIndex={active ? 0 : -1}>
        <BannerImage alt={banner.title} src={banner.main_image_url} />
      </BannerImageLink>
    </CarouselItemContainer>
  );
}

export interface TopBannerCarouselProps {
  banners: TopBanner[];
  slug?: string;
}

export default function TopBannerCarousel(props: TopBannerCarouselProps) {
  const { banners, slug } = props;
  const len = banners.length;
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [touchDiff, setTouchDiff] = React.useState<number>();

  const handleLeftClick = React.useCallback(() => setCurrentIdx(idx => (idx - 1 + len) % len), [
    len,
  ]);
  const handleRightClick = React.useCallback(() => setCurrentIdx(idx => (idx + 1) % len), [len]);

  // 반응형 너비 조정
  const isMobile = useMediaQuery({ minWidth: `${IMAGE_WIDTH}px` });
  const isDesktop = useMediaQuery({ minWidth: '1000px' });
  const [width, setWidth] = React.useState(IMAGE_WIDTH);
  const [inactiveScale, setInactiveScale] = React.useState(1);
  React.useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - ITEM_MARGIN * 2);
    }

    const newWidth = calcItemWidth(isDesktop, isMobile);
    if (newWidth == null) {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
    setWidth(newWidth);
  }, [isDesktop, isMobile]);
  React.useEffect(() => {
    setInactiveScale(isDesktop ? DESKTOP_INACTIVE_SCALE : 1);
  }, [isDesktop]);

  // 터치 핸들링
  const wrapperRef = React.useRef<HTMLDivElement>();
  const touchRef: any = React.useRef(null);

  const handleTouchStart = React.useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchRef.current != null) {
      return;
    }
    setTouchDiff(0);
    const touch = e.touches[0];
    touchRef.current = {
      id: touch.identifier,
      startX: touch.clientX,
      at: window.performance.now(),
    };
  }, []);

  // passive: false 때문에 useEffect
  React.useEffect(() => {
    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (touchRef.current == null) {
        return;
      }
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches[i];
        if (touch.identifier === touchRef.current.id) {
          const diff = touch.clientX - touchRef.current.startX;
          setTouchDiff(diff);
          break;
        }
      }
    }
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (touchRef.current == null) {
        return;
      }
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches[i];
        if (touch.identifier === touchRef.current.id) {
          const diff = touch.clientX - touchRef.current.startX;
          const dTime = window.performance.now() - touchRef.current.at;
          const velocity = diff / dTime; // px/ms
          const vThreshold = (width + ITEM_MARGIN) / 200 / 3;
          // threshold 처리
          if (diff > width / 3 || velocity > vThreshold) {
            setCurrentIdx(idx => (idx - 1 + len) % len);
          }
          if (diff < -width / 3 || velocity < -vThreshold) {
            setCurrentIdx(idx => (idx + 1) % len);
          }
          setTouchDiff(undefined);
          touchRef.current = null;
          break;
        }
      }
    },
    [width],
  );

  const handleTouchCancel = React.useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchRef.current == null) {
      return;
    }
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      if (touches[i].identifier === touchRef.current.id) {
        setTouchDiff(undefined);
        touchRef.current = null;
        break;
      }
    }
  }, []);

  // 포커스 시 스크롤 안 되게 막는 부분
  const [focused, setFocused] = React.useState(false);
  const handleFocus = React.useCallback(() => setFocused(true), []);
  const handleBlur = React.useCallback(() => setFocused(false), []);

  React.useEffect(() => {
    if (touchDiff != null || focused) {
      return;
    }
    const handle = window.setTimeout(handleRightClick, SCROLL_DURATION);
    return () => window.clearTimeout(handle);
  }, [handleRightClick, currentIdx, touchDiff, focused]);

  // 트래킹
  // const [tracker] = useEventTracker();
  // React.useEffect(() => {
  //   const device = getDeviceType();
  //   const deviceType = ['mobile', 'tablet'].includes(device) ? 'Mobile' : 'Pc';
  //   // FIXME: 이게 최선입니까?
  //   window.setImmediate(() => {
  //     const item = {
  //       id: banners[currentIdx].id,
  //       order: currentIdx,
  //       ts: new Date().getTime(),
  //     };
  //     tracker.sendEvent('display', {
  //       section: `${deviceType}.${slug}`,
  //       items: [item],
  //     });
  //   });
  // }, [banners, currentIdx]);

  return (
    <CarouselWrapper
      ref={wrapperRef}
      itemWidth={width}
      inactiveScale={inactiveScale}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <BigBannerCarousel
        totalItems={len}
        itemWidth={width}
        itemMargin={ITEM_MARGIN}
        inactiveScale={inactiveScale}
        currentIdx={currentIdx}
        touchDiff={touchDiff}
      >
        {({ index, activeIndex, itemWidth }) => (
          <CarouselItem
            key={index}
            itemWidth={itemWidth}
            inactiveScale={inactiveScale}
            banner={banners[index]}
            active={index === activeIndex}
            invisible={
              !checkWithinRingRange(
                (activeIndex - SLIDE_RADIUS + len) % len,
                (activeIndex + SLIDE_RADIUS) % len,
                index,
              )
            }
          />
        )}
      </BigBannerCarousel>
      <CarouselControllerWrapper>
        <CarouselController itemWidth={width}>
          <SlideBadge>
            <strong>{currentIdx + 1}</strong>
            {` / ${len}`}
          </SlideBadge>
        </CarouselController>
      </CarouselControllerWrapper>
      {!!isMobile && (
        <CarouselControllerWrapper>
          <ArrowWrapper>
            <Arrow onClick={handleLeftClick}>
              <ArrowLeft className="ControllArrow" />
              <span className="a11y">이전 배너 보기</span>
            </Arrow>
          </ArrowWrapper>
          <CarouselController itemWidth={width} />
          <ArrowWrapper>
            <Arrow onClick={handleRightClick}>
              <ArrowRight className="ControllArrow" />
              <span className="a11y">다음 배너 보기</span>
            </Arrow>
          </ArrowWrapper>
        </CarouselControllerWrapper>
      )}
    </CarouselWrapper>
  );
}
