import axios from '../api/axios';

// 아이디 전송
export async function sendId({ userId, token, type, userType }) {
  const res = await axios.post('/find-id/send', {
    userId,
    token,
    type,
    userType,
  });
  // 서버 메시지 우선, 없으면 기본 문구
  const defaultMsg =
    type === 'email'
      ? '아이디가 이메일로 전송되었습니다.'
      : '아이디가 휴대폰으로 전송되었습니다.';
  alert(res?.data?.message || defaultMsg);
}

// 비밀번호 전송
export async function sendPw({ userId, type, userType }) {
  const res = await axios.post('/find-password/send', {
    userId,
    type,
    userType,
  });
  const defaultMsg =
    type === 'email'
      ? '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
      : '비밀번호 재설정 링크가 휴대폰으로 전송되었습니다.';
  alert(res?.data?.message || defaultMsg);
}
