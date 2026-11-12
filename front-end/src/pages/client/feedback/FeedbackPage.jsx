// FeedbackPage.jsx
import React, { useState } from 'react';
import FeedbackList from './FeedbackList';
import FeedbackForm from './FeedbackForm';

const FeedbackPage = ({ productDetailId }) => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="feedback-page">
      <h3>Đánh Giá Sản Phẩm</h3>

      <FeedbackForm
        productDetailId={productDetailId}
        onFeedbackSubmitted={() => setRefresh(prev => !prev)} // Khi gửi xong thì reload list
      />

      <FeedbackList
        productDetailId={productDetailId}
        refreshFlag={refresh} // Sửa ở đây: truyền đúng prop refreshFlag
      />
    </div>
  );
};

export default FeedbackPage;
