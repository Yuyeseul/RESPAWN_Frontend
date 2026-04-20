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
    black: '#000000', // #000검정
    mouse_over: '#c5c5c523', // 마우스 오버 효과
    overlay: 'rgba(0, 0, 0, 0.5)', // 모달 배경용 반투명 검정
    overlay_line: 'rgba(0, 0, 0, 0.15)', // 모달 배경용 더 연한 반투명 검정
    primary: 'rgb(85, 90, 130)', // 메인 네이비
    primary_dark: '#3e4263', // Hover용 어두운 프라이머리
    primary_light: '#f0f2f8', // 연한 배경용 프라이머리
    primary_hover: '#e6e8f4', // 옅은 프라이머리 Hover
    primary_alpha: 'rgba(85, 90, 130, 0.1)', // 포커스/그림자용
    secondary: 'rgb(105, 111, 148)', // 보조 네이비
    lightNavy: 'rgb(215, 219, 235)', // 연한 네이비

    // 상태 컬러
    success: '#28a745',
    success_light: '#4caf50',
    danger: '#dc3545',
    danger_light: '#ef4444', // 밝은 에러 레드
    danger_bg: '#fef2f2', // 에러 배경
    danger_border: '#fca5a5', // 에러 테두리
    green: '#45a745',
    red: '#d32f2f',
    yellow: '#ffc107',
    star: '#f59e0b', // 별점 노란색
    orange: '#ff9500',
    wish: '#ff4d4d',
    pale_pink: '#ffe6e6',
    pink_lace: '#fff4f4',
    angel_pink: '#fff0f0',
    blue: '#2196f3',
    purple: '#673ab7',
    purple_dark: '#9c27b0',
    sky_light: '#e0f2fe', // 뱃지 배경 블루
    sky_dark: '#0284c7', // 뱃지 텍스트 블루

    // 무채색 계열
    white: '#ffffff', // #fff
    white1: '#fff0f0',
    gray: {
      10: '#fefefe',
      50: '#fcfcfd', // 더 밝은 배경
      100: '#f8f9fa', // 배경
      200: '#eeeeee', // #eee - 글자
      300: '#dddddd', // #ddd - 경계선/ 테두리
      400: '#cccccc', // #ccc - 미정
      500: '#adb5bd', // 미정
      550: '#888888', // #999 - 흐린 글자
      600: '#666666', // #666 - 보조 텍스트/ 메뉴 글자
      650: '#555555', // #555 - 어두운 글자
      700: '#444444', // #444 - 일반 본문 텍스트
      800: '#333333', // #333 - 어두운버튼
      900: '#212529', // 진한 글자
    },
  },
};

export default theme;
