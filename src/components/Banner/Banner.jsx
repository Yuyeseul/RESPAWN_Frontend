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
    <Swiper
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
    </Swiper>
  );
};

export default Banner;

const ImgBanner = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
`;
