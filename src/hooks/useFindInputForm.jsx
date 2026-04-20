import React, { useEffect, useRef, useState } from 'react';

export const MODE_PHONE = 'phone';
export const MODE_EMAIL = 'email';

export const USER_BUYER = 'buyer';
export const USER_SELLER = 'seller';

export const FIELD_NAME = 'name';
export const FIELD_USERNAME = 'username';
export const FIELD_PHONE = 'phone';
export const FIELD_EMAIL = 'email';

/**
 * - 아이디/비밀번호 찾기 같은 입력 폼에서 공통적으로 쓰이는 로직을 모아 둔 훅
 *   1) 필드 구성(fields)에 따라 포커스 이동/엔터 동작이 자동으로 맞춰짐
 *   2) validate/buildRequestData/onSuccess/endpoint/axiosInstance를 주입 받아 화면별로 커스터마이즈
 *   3) 입력 onChange, 엔터 처리, 자동 포커스, 제출 흐름(로딩/에러)까지 캡슐화
 */
export function useFindInputForm({
  fields, // 예: ['name','phone'] 또는 ['name','username','email']
  validate, // (values, mode) => string | ''  (에러 메시지)
  buildRequestData, // (values, mode, userType) => object (요청바디)
  sendApi, // 추가: (requestData) => Promise<data>
  onSuccess, // (data, values) => void
}) {
  const [mode, setMode] = useState(MODE_PHONE);
  const [userType, setUserType] = useState(USER_BUYER);
  const [values, setValues] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // refs 매핑 (포커스)
  const refs = {
    name: useRef(null),
    username: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    form: useRef(null),
  };

  // 최초 포커스
  useEffect(() => {
    refs.name.current?.focus();
  }, []);

  // 자동 포커스 이동 (사용자 타이핑 중이면 중단)
  useEffect(() => {
    const active = document.activeElement;
    const isTyping = fields.some((k) => active === refs[k]?.current);
    if (isTyping) return;

    // 순서대로 비어있는 첫 필드 포커스
    for (const key of fields) {
      if (!values[key]?.trim()) {
        refs[key]?.current?.focus();
        return;
      }
    }
    // 연락처 포커스
    if (fields.includes(FIELD_PHONE) && mode === MODE_PHONE) {
      refs.phone.current?.focus();
    } else if (fields.includes(FIELD_EMAIL) && mode === MODE_EMAIL) {
      refs.email.current?.focus();
    }
  }, [mode, values, fields]);

  /**
   * key를 받아 해당 필드 값만 갱신하는 콜백을 반환
   */
  const onChange = (key) => (e) => {
    const v = e.target.value;
    setValues((prev) => ({
      ...prev,
      [key]: key === FIELD_PHONE ? v.replace(/\D/g, '') : v,
    }));
  };

  /**
   * 현재 필드 기준으로 다음 필드에 포커스 이동
   */
  const focusByOrder = (fromKey) => {
    const idx = fields.indexOf(fromKey);
    if (idx > -1 && idx < fields.length - 1) {
      const nextKey = fields[idx + 1];
      refs[nextKey]?.current?.focus();
    }
  };

  /**
   * 검증 실패 시 포커스 줄 위치 결정
   * 우선순위: 비어있는 필드 → 연락수단 필드(형식 오류 등)
   */
  const focusByError = (msg) => {
    // 비어있는 필드부터 포커스
    for (const key of fields) {
      if (!values[key]?.trim()) {
        refs[key]?.current?.focus();
        return;
      }
    }
    // 형식 오류 등은 연락처 필드에 포커스
    if (mode === MODE_PHONE) refs.phone?.current?.focus();
    else refs.email?.current?.focus();
  };

  /**
   * - 마지막 필드가 아니면: 현재 필드가 비었는지 확인 후 다음 필드로 포커스 이동
   * - 마지막 필드면: 제출 시도
   */
  const handleEnterKey = (e, field) => {
    if (e.isComposing || e.key !== 'Enter') return;
    e.preventDefault();
    if (loading) return;

    // 아직 다음 필드가 남아있는 경우: 현재 필드 비어있으면 에러, 아니면 다음 필드로
    const idx = fields.indexOf(field);
    const isLastField = idx === fields.length - 1;
    if (!isLastField) {
      if (!values[field]?.trim()) {
        setError(labelByKey(field) + '를 입력해주세요.');
        refs[field]?.current?.focus();
        return;
      }
      setError('');
      focusByOrder(field);
      return;
    }

    // 마지막 필드에서는 제출
    submit();
  };

  /**
   * 검증 후 API 호출 → 성공/실패 처리
   * - validate로 전체값 점검(화면별 로직 주입)
   */
  const submit = async () => {
    if (loading) return;

    setError('');
    const msg = validate(values, mode);
    if (msg) {
      setError(msg);
      focusByError(msg);
      return;
    }

    const requestData = buildRequestData(values, mode, userType);
    try {
      setLoading(true);
      const data = await sendApi(requestData);
      onSuccess(data, values);
    } catch (err) {
      console.log('API 응답:', err);
      const message = err?.response?.data?.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    userType,
    setUserType,
    values,
    setValues,
    loading,
    error,
    setError,
    refs,
    onChange,
    handleEnterKey,
    submit,
  };
}

function labelByKey(key) {
  switch (key) {
    case FIELD_NAME:
      return '이름';
    case FIELD_USERNAME:
      return '아이디';
    case FIELD_PHONE:
      return '전화번호';
    case FIELD_EMAIL:
      return '이메일';
    default:
      return '값';
  }
}
