import React, { useState, useEffect } from 'react';
import Logo from '../../components/common/Logo';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  TopBar,
  BackButton,
  LogoWrapper,
  Box,
  Title,
  TabWrapper,
  Tab,
  RadioGroup,
  RadioLabel,
  InputGroup,
  Label,
  Input,
  SubmitButton,
  Message,
} from '../../styles/FindInputStyles';

import {
  useFindInputForm,
  MODE_PHONE,
  MODE_EMAIL,
  USER_BUYER,
  USER_SELLER,
  FIELD_NAME,
  FIELD_USERNAME,
  FIELD_PHONE,
  FIELD_EMAIL,
} from '../../hooks/useFindInputForm';

import { validateFindPw } from '../../utils/validators';
import { findPasswordApi } from '../../utils/FindInputApi';

const FindPwInputStep = ({ onComplete }) => {
  const navigate = useNavigate();

  const [modeState, setModeState] = useState(MODE_PHONE);
  const fieldConfig =
    modeState === MODE_PHONE
      ? [FIELD_NAME, FIELD_USERNAME, FIELD_PHONE]
      : [FIELD_NAME, FIELD_USERNAME, FIELD_EMAIL];

  const {
    mode,
    setMode,
    userType,
    setUserType,
    values,
    onChange,
    loading,
    error,
    setError,
    refs,
    handleEnterKey,
    submit,
  } = useFindInputForm({
    fields: fieldConfig,
    validate: validateFindPw,
    buildRequestData: (v, mode, userType) => {
      const base = { name: v.name, username: v.username, userType };
      return mode === MODE_PHONE
        ? { ...base, phoneNumber: v.phone }
        : { ...base, email: v.email };
    },
    sendApi: async (requestData) => {
      const data = await findPasswordApi(requestData);
      return data;
    },
    onSuccess: (data, v) => {
      if (data) {
        if (data.userId) sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userType', userType);
        onComplete({
          name: v.name,
          phoneNumber: data.phoneNumber,
          email: data.email,
        });
      } else {
        setError(data?.message || '조회 실패');
      }
    },
  });

  useEffect(() => {
    setMode(modeState);
  }, [modeState, setMode]);

  return (
    <Container>
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
      </TopBar>

      <LogoWrapper>
        <Logo />
      </LogoWrapper>

      <Box
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) submit();
        }}
        ref={refs.form}
      >
        <Title>비밀번호 찾기</Title>

        <TabWrapper>
          <Tab
            isActive={mode === MODE_PHONE}
            onClick={() => setModeState(MODE_PHONE)}
          >
            전화번호로 찾기
          </Tab>
          <Tab
            isActive={mode === MODE_EMAIL}
            onClick={() => setModeState(MODE_EMAIL)}
          >
            이메일로 찾기
          </Tab>
        </TabWrapper>

        <RadioGroup>
          <RadioLabel>
            <input
              type="radio"
              name="userType"
              value={USER_BUYER}
              checked={userType === USER_BUYER}
              onChange={(e) => setUserType(e.target.value)}
            />
            구매자
          </RadioLabel>
          <RadioLabel>
            <input
              type="radio"
              name="userType"
              value={USER_SELLER}
              checked={userType === USER_SELLER}
              onChange={(e) => setUserType(e.target.value)}
            />
            판매자
          </RadioLabel>
        </RadioGroup>

        <InputGroup>
          <Label>이름</Label>
          <Input
            ref={refs.name}
            type="text"
            placeholder="이름"
            value={values.name}
            onChange={onChange(FIELD_NAME)}
            onKeyDown={(e) => handleEnterKey(e, FIELD_NAME)}
          />
        </InputGroup>

        <InputGroup>
          <Label>아이디</Label>
          <Input
            ref={refs.username}
            type="text"
            placeholder="아이디"
            value={values.username}
            onChange={onChange(FIELD_USERNAME)}
            onKeyDown={(e) => handleEnterKey(e, FIELD_USERNAME)}
          />
        </InputGroup>

        {mode === MODE_PHONE ? (
          <InputGroup>
            <Label>전화번호</Label>
            <Input
              ref={refs.phone}
              type="tel"
              placeholder="예: 01012345678"
              value={values.phone}
              onChange={onChange(FIELD_PHONE)}
              onKeyDown={(e) => handleEnterKey(e, FIELD_PHONE)}
            />
          </InputGroup>
        ) : (
          <InputGroup>
            <Label>이메일</Label>
            <Input
              ref={refs.email}
              type="email"
              placeholder="ex) aa@naver.com"
              value={values.email}
              onChange={onChange(FIELD_EMAIL)}
              onKeyDown={(e) => handleEnterKey(e, FIELD_EMAIL)}
            />
          </InputGroup>
        )}

        {error && <Message>{error}</Message>}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? '조회 중...' : '비밀번호 찾기'}
        </SubmitButton>
      </Box>
    </Container>
  );
};

export default FindPwInputStep;
