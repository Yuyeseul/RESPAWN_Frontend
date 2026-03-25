export const openKakaoChat = () => {
  const channelId = '_xaihEX';

  const chatUrl = `http://pf.kakao.com/${channelId}/chat`;

  window.open(chatUrl, '_blank');
};
