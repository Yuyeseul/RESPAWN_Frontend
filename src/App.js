import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import MainPage from './pages/MainPage';
import LogInPage from './pages/LogInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import Mypage from './pages/Mypage';
import LoginOkPage from './pages/LoginOkPage';
import UploadProduct from './components/Seller/Upload/UploadProduct';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import SellerCenterPage from './pages/SellerCenterPage';
import ProductList from './components/Seller/List/ProductList';
import RefundList from './components/Seller/List/RefundList';
import RefundDetail from './components/Seller/Detail/RefundDetail';
import OrderList from './components/Seller/List/OrderList';
import ReviewList from './components/Seller/List/ReviewList';
import ReviewDetail from './components/Seller/Detail/ReviewDetail';
import EditProduct from './components/Seller/Detail/EditProduct';
import OrderDetail from './components/Seller/Detail/OrderDetail';
import OrderCompletePage from './pages/OrderCompletePage';
import InquiryList from './components/Seller/List/InquiryList';
import FindIdPage from './pages/FindIdPage';
import FindPwPage from './pages/FindPwPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserInfo from './components/Seller/Detail/UserInfo';
import CustomerCenterPage from './pages/CustomerCenterPage';
import PasswordUpdateRequiredPage from './pages/PasswordUpdateRequiredPage';
import AdminLayout from './components/Admin/AdminLayout';
import Members from './components/Admin/Members';
import MemberDetail from './components/Admin/MemberDetail';
import Notices from './components/Admin/Notices';
import Login from './components/Admin/Login';
import SearchResultListPage from './pages/SearchResultListPage';
import ProfileComplete from './pages/ProfileComplete';
import NoticeRegister from './components/Admin/NoticeRegister';
import NoticeDetail from './components/Admin/NoticeDetail';
import CustomerCenter from './components/CustomerCenter/CustomerCenter';
import NoticeList from './components/CustomerCenter/NoticeList';
import Notice from './components/CustomerCenter/Notice';
import Faq from './components/CustomerCenter/Faq';
import { AuthProvider } from './AuthContext';
import ChatbotContainer from './components/Chatbot/ChatbotContainer';
import ComingSoon from './pages/ComingSoon';
import PaymentCallback from './pages/PaymentCallback';

function App() {
  return (
    <>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
            <ChatbotContainer />
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/profile/complete" element={<ProfileComplete />} />
              <Route path="/search" element={<SearchResultListPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="members" element={<Members />} />
                <Route
                  path="members/:userType/:userId"
                  element={<MemberDetail />}
                />
                <Route path="notices" element={<Notices />} />
                <Route path="noticeRegister" element={<NoticeRegister />} />
                <Route path="notices/:noticeId" element={<NoticeDetail />} />
              </Route>
              <Route path="/adminlogin" element={<Login />} />
              <Route path="/uploadproduct" element={<UploadProduct />} />
              <Route
                path="/productdetail/:id"
                element={<ProductDetailPage />}
              />
              <Route path="/customerCenter" element={<CustomerCenterPage />}>
                <Route index element={<CustomerCenter />} />
                <Route path="noticelist" element={<NoticeList />} />
                <Route path="notices/:noticeId" element={<Notice />} />
                <Route path="faq" element={<Faq />} />
              </Route>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/login" element={<LogInPage />} />
              <Route path="/mypage/*" element={<Mypage />} />
              <Route path="/loginOk" element={<LoginOkPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/findid" element={<FindIdPage />} />
              <Route path="/findPw" element={<FindPwPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/payments/mobile/callback" element={<PaymentCallback />} />
              <Route
                path="/update-password"
                element={<PasswordUpdateRequiredPage />}
              />
              <Route path="/order/:orderId" element={<OrderPage />} />
              <Route
                path="/order/:orderId/complete"
                element={<OrderCompletePage />}
              />
              <Route path="/sellerCenter" element={<SellerCenterPage />}>
                <Route index element={<Navigate to="productList" replace />} />
                <Route path="productList" element={<ProductList />} />
                <Route path="uploadProduct" element={<UploadProduct />} />
                <Route path="refundList" element={<RefundList />} />
                <Route path="orderList" element={<OrderList />} />
                <Route path="reviewList" element={<ReviewList />} />
                <Route path="inquiryList" element={<InquiryList />} />
                <Route
                  path="refundList/:orderItemId"
                  element={<RefundDetail />}
                />
                <Route path="reviewList/:reviewId" element={<ReviewDetail />} />
                <Route path="productList/:id" element={<EditProduct />} />
                <Route
                  path="orderList/:orderItemId"
                  element={<OrderDetail />}
                />
                <Route path="profile" element={<UserInfo />} />
              </Route>
              <Route
                path="/new-products"
                element={<ComingSoon title="신상품" />}
              />
              <Route
                path="/best-seller"
                element={<ComingSoon title="베스트셀러" />}
              />
              <Route path="/brands" element={<ComingSoon title="브랜드" />} />
              <Route path="/events" element={<ComingSoon title="이벤트" />} />
              <Route path="/*" element={<NotFoundPage />} />
            </Routes>
      </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
