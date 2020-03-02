import styled from '@emotion/styled';
import React from 'react';

interface TransformOptions {
  slideToMove: number;
  slideCount: number;
  inactiveScale: number;
  slideMargin: number;
  touchDiff?: number;
}

function computeTransform(options: TransformOptions) {
  const { slideToMove: k, slideCount: n, inactiveScale: r, slideMargin: d, touchDiff } = options;
  const commonDivider = (n - 1) * r + 1;
  const percentage = (25 + 50 * k * r) / commonDivider;
  const negPixels = (0.5 * n * d + (r - 1) * d * k) / commonDivider;
  const touch = touchDiff ?? 0;
  return `translateX(${-percentage}%) translateX(${negPixels}px) translateX(${touch}px)`;
}

const CarouselView = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
`;

const CarouselList = styled.ul<{ height: number; slideMargin: number }>`
  flex: none;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: ${props => props.height}px;
  padding: 0px;
  margin: 0px;

  > * {
    margin-right: ${props => props.slideMargin}px;
  }
`;

export interface BigBannerCarouselProps {
  totalItems: number;
  currentIdx: number;
  itemWidth: number;
  itemMargin: number;
  inactiveScale: number;
  children: (props: { index: number; activeIndex: number; itemWidth: number }) => React.ReactNode;
  touchDiff?: number;
}

export default function BigBannerCarousel(props: BigBannerCarouselProps) {
  const {
    children,
    totalItems: len,
    touchDiff,
    currentIdx,
    itemWidth,
    itemMargin,
    inactiveScale,
  } = props;
  const [previousIdx, setPreviousIdx] = React.useState(currentIdx);
  const [activeIdx, setActiveIdx] = React.useState(currentIdx);
  const [activeDiff, setActiveDiff] = React.useState(touchDiff);
  const [isMoving, setMoving] = React.useState(false);
  const itemHeight = itemWidth;

  const handleTransitionDone = React.useCallback(
    (e: React.TransitionEvent<HTMLUListElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }
      e.stopPropagation();

      setPreviousIdx(activeIdx);
      setMoving(false);
    },
    [activeIdx],
  );

  React.useEffect(() => {
    setActiveIdx(currentIdx);
    setMoving(true);
  }, [currentIdx]);

  React.useEffect(() => {
    setActiveDiff(touchDiff);
  }, [touchDiff]);

  React.useEffect(() => {
    if (activeDiff != null) {
      setPreviousIdx(activeIdx);
      setMoving(false);
    }
  }, [activeDiff, activeIdx]);

  const idxArray = Array.from({ length: len }, (_, idx) => (idx + previousIdx) % len);

  const itemNodes = idxArray.map(index => children({ index, activeIndex: activeIdx, itemWidth }));
  let delta = activeIdx - previousIdx;
  if (Math.abs(delta) > Math.abs(delta + len)) {
    delta += len;
  }
  if (Math.abs(delta) > Math.abs(delta - len)) {
    delta -= len;
  }
  return (
    <CarouselView>
      <CarouselList
        height={itemHeight}
        slideMargin={itemMargin}
        style={{
          transition: isMoving ? 'transform 0.2s' : undefined,
          transform: computeTransform({
            slideToMove: delta,
            slideCount: len,
            touchDiff: activeDiff,
            inactiveScale,
            slideMargin: itemMargin,
          }),
        }}
        onTransitionEnd={handleTransitionDone}
      >
        {itemNodes}
        {itemNodes}
      </CarouselList>
    </CarouselView>
  );
}

BigBannerCarousel.defaultProps = {
  itemMargin: 0,
  inactiveScale: 1,
};
