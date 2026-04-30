import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MypageDetail from '../components/Mypage/MypageDetail';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import OrderHistory from '../components/Mypage/OrderHistory/OrderHistory';
import UserInfo from '../components/Mypage/UserInfo';
import MainInfo from '../components/Mypage/MainInfo';
import MyInquiryList from '../components/Mypage/MyInquiryList';
import MyReviewList from '../components/Mypage/MyReviewList';
import RefundPage from '../components/Mypage/ReturnExchange/RefundPage';
import ReviewPage from '../components/Mypage/Review/ReviewPage';
import RefundDetail from '../components/Mypage/ReturnExchange/RefundDetail';
import MyPoint from '../components/Mypage/MyPoint';
import Coupon from '../components/Mypage/Coupon';
import Wishlist from '../components/Mypage/Wishlist';
import BuyerChatPage from '../components/Mypage/BuyerChatPage';

function Mypage() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/*" element={<MypageDetail />}>
          <Route index element={<MainInfo />} />
          <Route path="coupon" element={<Coupon />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="profile" element={<UserInfo />} />
          <Route path="refund" element={<RefundDetail />} />
          <Route path="review" element={<MyReviewList />} />
          <Route path="point" element={<MyPoint />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="chat" element={<BuyerChatPage />} />
          <Route path="chat/:roomId" element={<BuyerChatPage />} />
          <Route path="inquiry_history" element={<MyInquiryList />} />
          <Route
            path="orders/:orderId/items/:itemId/registerRefund"
            element={<RefundPage />}
          />
          <Route
            path="orders/:orderId/items/:itemId/registerReview"
            element={<ReviewPage />}
          />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default Mypage;
