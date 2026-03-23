import React from 'react';
import styled from 'styled-components';
import logo from '../../assets/respawn_logo.png';

const Logo = () => {
  return (
    <LogoContainer>
      <a href="/">
        <img src={logo} alt="respawn logo" />
      </a>
    </LogoContainer>
  );
};

export default Logo;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 60px;
    object-fit: contain;

    @media ${({ theme }) => theme.mobile} {
      height: 35px;
    }
  }
`;
