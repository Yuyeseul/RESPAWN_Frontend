import React from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import banner1 from '../../assets/banner1.png';
import banner2 from '../../assets/banner2.png';

const Banner = () => {
  return (
    <StyledSwiper
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 10000 }}
      loop={true}
    >
      <SwiperSlide>
        <ImgBanner src={banner1} alt="banner1" />
      </SwiperSlide>
      <SwiperSlide>
        <ImgBanner src={banner2} alt="banner2" />
      </SwiperSlide>
    </StyledSwiper>
  );
};

export default Banner;

const StyledSwiper = styled(Swiper)`
  --swiper-navigation-color: ${({ theme }) => theme.colors.primary};
  --swiper-pagination-color: ${({ theme }) => theme.colors.primary};
  --swiper-pagination-bullet-inactive-color: ${({ theme }) =>
    theme.colors.gray[300]};
  --swiper-pagination-bullet-inactive-opacity: 0.7;

  .swiper-button-next,
  .swiper-button-prev {
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    @media ${({ theme }) => theme.mobile} {
      display: none;
    }
  }

  .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    transition: all 0.3s;
  }
  .swiper-pagination-bullet-active {
    width: 24px;
    border-radius: 5px;
  }
`;

const ImgBanner = styled.img`
  width: 100%;
  height: 450px;
  object-fit: cover;
  cursor: pointer;

  @media ${({ theme }) => theme.mobile} {
    height: 250px;
  }
`;
