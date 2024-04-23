import React from 'react';
import { Carousel } from 'antd';
import styled from 'styled-components';
import _ from 'lodash';
import { coverUrls } from './utils';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';

const CarouselWrapper = styled(Carousel)`
  &.slick-slider .slick-dots {
    left: unset !important;
    right: 12px !important;
    bottom: 16px !important;
    margin: 0 !important;
    li {
      width: 10px;
      height: 10px;
      button {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 1px solid #fff;
        background-color: transparent;
        box-shadow: 0 2px 6px 0px rgb(0 0 0 / 15%);
        opacity: 1;
        &:hover {
          opacity: 1;
          background-color: #fff;
        }
      }
      &.slick-active {
        width: 10px;
        button {
          background-color: #fff !important;
        }
      }
    }
  }
  .image {
    background-color: #454545;
    background-repeat: no-repeat;
    background-position: center;
    transition: all 2s ease;
    &:hover {
      transform: scale(1.05);
    }
  }
  .explain {
    position: absolute;
    bottom: 0;
    width: 100%;
    max-height: 100%;
    padding: ${({ isMobile }) => (isMobile ? '10px 70px 10px 16px' : '24px 180px 16px 16px')};
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(9, 5, 5, 0.03) 16%, rgba(0, 0, 0, 0.28) 100%);
    .titleText {
      color: #fff;
      font-size: ${({ isMobile }) => (isMobile ? '15px' : '17px')};
      font-weight: bold;
      text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
    }
  }
`;

const BulletinSkeleton = styled.div`
  flex: 1;
  padding: 24px;
  .skeletonBlock {
    width: 100%;
    height: 100%;
    background-color: #f6f6f6;
    border-radius: 11px;
  }
`;

export default function BulletinBoard(props) {
  const { loading, platformSetting = {}, height } = props;
  const { bulletinBoards = [] } = platformSetting;

  if (loading) {
    return (
      <BulletinSkeleton>
        <div className="skeletonBlock"></div>
      </BulletinSkeleton>
    );
  }

  return (
    <CarouselWrapper autoplay={true} isMobile={browserIsMobile()}>
      {bulletinBoards
        .concat(!bulletinBoards.length ? [{ url: md.global.FileStoreConfig.pictureHost + coverUrls[0] }] : [])
        .map(item => {
          return (
            <div
              className="Relative"
              style={{ height: `${height}px` }}
              onClick={item.link ? () => window.open(item.link) : _.noop}
            >
              <div
                className={cx('image', { pointer: item.link })}
                style={{
                  backgroundImage: `url(${item.url})`,
                  height: `${height}px`,
                  backgroundSize: `auto ${height}px`,
                }}
              />
              {item.title && (
                <div className={cx('explain', { pointer: item.link })}>
                  <div className="titleText">{item.title}</div>
                </div>
              )}
            </div>
          );
        })}
    </CarouselWrapper>
  );
}
