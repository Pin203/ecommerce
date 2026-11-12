// FeedbackPage.jsx
import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';

const FeedbackPage = ({ productDetailId }) => {
  const [refresh, setRefresh] = useState(false); // ✅ khai báo đúng

  return (
    <div className="feedback-page">
      <h3>Đánh Giá Sản Phẩm</h3>

      <FeedbackForm
        productDetailId={productDetailId}
        onFeedbackSubmitted={() => setRefresh(prev => !prev)} // ✅ toggle refresh
      />

      {/* Nếu có danh sách feedback thì truyền refreshFlag xuống */}
      {/* <FeedbackList
        productDetailId={productDetailId}
        refreshFlag={refresh}
      /> */}
    </div>
  );
};

export default FeedbackPage;
