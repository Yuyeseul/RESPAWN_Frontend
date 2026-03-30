const size = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1025px',
};

const theme = {
  mobile: `(max-width: ${size.mobile})`,
  tablet: `(max-width: ${size.tablet})`,
  desktop: `(min-width: ${size.desktop})`,

  maxWidth: '1200px',

  colors: {
    // 메인 포인트 컬러
    primary: 'rgb(85, 90, 130)', // 메인 네이비
    secondary: 'rgb(105, 111, 148)', // 보조 네이비
    lightNavy: 'rgb(215, 219, 235)', // 연한 네이비

    // 상태 컬러
    success: '#28a745',
    danger: '#dc3545',
    green: '#45a745',
    red: '#d32f2f',
    yellow: '#ffc107',
    orange: '#ff9500',

    // 무채색 계열
    white: '#ffffff', // #fff
    gray: {
      10: '#fefefe',
      50: '#fcfcfd', // 더 밝은 배경
      100: '#f8f9fa', // 배경
      200: '#eeeeee', // #eee - 글자
      300: '#dddddd', // #ddd - 경계선/ 테두리
      400: '#cccccc', // #ccc - 미정
      500: '#adb5bd', // 미정
      600: '#666666', // #666 - 보조 텍스트/ 메뉴 글자
      700: '#444444', // #444 - 일반 본문 텍스트
      800: '#333333', // #333 - 어두운버튼
      900: '#212529', // 진한 글자
    },
  },
};

export default theme;
