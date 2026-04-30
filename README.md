# 🎮 RESPAWN - E-Commerce Frontend Service

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>
  <img src="https://img.shields.io/badge/Styled_Components-DB7093?style=flat-square&logo=styled-components&logoColor=white"/>
  <img src="https://img.shields.io/badge/Create_React_App-09D3AC?style=flat-square&logo=createreactapp&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=Axios&logoColor=white"/>
  <br>
  <img src="https://img.shields.io/badge/Oracle_Cloud-F80000?style=flat-square&logo=Oracle&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=Nginx&logoColor=white"/>
  <br>
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=Git&logoColor=white"/>
  <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=GitHub&logoColor=white"/>
  <img src="https://img.shields.io/badge/Notion-000000?style=flat-square&logo=Notion&logoColor=white"/>
  <img src="https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=Discord&logoColor=white"/>
</p>

## 📝 Project Overview
**RESPAWN**은 게이머들을 위한 프리미엄 이커머스 플랫폼의 프론트엔드 애플리케이션입니다. 
단순한 쇼핑몰을 넘어, 사용자의 경험을 최우선으로 고려한 직관적인 UI/UX와 AI 기반의 챗봇 서비스를 제공합니다. 
React와 Styled Components를 기반으로 깔끔하고 유지보수하기 쉬운 구조를 구축했습니다.

<br>

## 👥 Team & Collaboration
- **개발 인원:** 총 2명
  - **Front-end:** [Yuyeseul](https://github.com/Yuyeseul) (React, Styled Components, API 연동 및 UI/UX 설계)
  - **Back-end:** [wonji426](https://github.com/wonji426) (제공된 API 사용 및 인프라 서버 배포)
- **협업 방식 및 개발 환경:**
  - **GitHub Projects:** 진행 상황을 페이지별로 나누어, GitHub Issues에서 각자 맡은 업무를 이슈 템플릿의 체크리스트 형식으로 공유했습니다.
  - **GitHub Wiki:** 회의 내용과 코드 컨벤션을 기록하고, 개발 요점 노트를 공유하여 일관성 있는 개발을 진행했습니다.
  - **Figma:** 동시 접속하여 함께 UI 컴포넌트 구조 및 색상 디자인 상의를 진행했습니다.
  - **Discord & Gather Town:** 원활한 의사소통을 위해 디스코드와 게더타운에서 영상 및 음성 통화를 적극 활용하여 문제를 빠르게 해결했습니다.

<br>

## 💻 Tech Stack & Environment

### Framework & Library
- **Front-end:** React, Styled Components, Create React App (CRA)
- **Back-end:** 제공된 API 사용
- **Network:** Axios

### Infrastructure & Deploy
- **Cloud:** Oracle Cloud Infrastructure (Ubuntu)
- **Container:** Docker
- **Web Server:** Nginx (Reverse Proxy)

<br>

## ✨ Core Features & UI/UX

- **반응형 쇼핑 UI 및 모바일 최적화**
  - 클린하고 현대적인 **카드형 레이아웃**을 적용하여 상품 정보 시인성 확보
  - 모바일 환경을 고려하여 중요 라벨의 위치를 좁은 화면에서도 명확하게 보이도록 최적화
- **실시간 AI 챗봇 인터페이스**
  - 답변 퀄리티와 사용자 경험을 높이기 위해 챗봇 배경 및 여백 등을 세밀하게 튜닝
  - 사용자 편의를 위해 채팅창 종료 시 대화 기록을 초기화하는 로직 적용
- **매끄러운 데이터 통신 및 인증**
  - 세션 기반 인증 방식을 적극 활용하여 보안을 챙기면서도 불필요한 요청 헤더를 줄여 네트워크 효율성 향상

<br>

## 🛠 Trouble Shooting & Deep Dive


<br>

## 📂 Project Directory Structure

<pre>
src
 ├── assets          // 아이콘, 이미지
 ├── components      // 컴포넌트
 ├── hooks           // 커스텀 훅
 ├── pages           // 메인 화면 컴포넌트
 ├── styles          // 전역 스타일 및 Styled Components
 ├── utils           // 유틸리티 함수
 ├── App.js          // 최상위 라우팅 및 레이아웃 설정
 └── index.js        // React 애플리케이션 진입점
</pre>

<br>

## 🚀 Getting Started

### 1. Repository Clone
<pre>
git clone https://github.com/Yuyeseul/RESPAWN_Frontend.git
cd RESPAWN_Frontend
</pre>

### 2. Dependencies Install
<pre>
npm install
</pre>

### 3. Environment Setup
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.
<pre>
REACT_APP_API_URL=http://your-backend-api.com
</pre>

### 4. Run Development Server
<pre>
npm start
</pre>

<br>

## 🔗 Links
- **Frontend Repository:** [RESPAWN_Frontend](https://github.com/Yuyeseul/RESPAWN_Frontend.git)
- **Backend Repository:** [RESPAWN_Backend](https://github.com/wonji426/RESPAWN_Backend.git)
