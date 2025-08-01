// FeedbackPage.jsx
import React, { useState } from 'react';

import FeedbackForm from './FeedbackForm';

const FeedbackPage = ({ productDetailId }) => {
  const [ setRefresh] = useState(false);

  return (
    <div className="feedback-page">
      <h3>Đánh Giá Sản Phẩm</h3>
      {/* feed back trang bill */}
      <FeedbackForm
        productDetailId={productDetailId}
        onFeedbackSubmitted={() => setRefresh(prev => !prev)} // Khi gửi xong thì reload list
      />

      {/* <FeedbackList
        productDetailId={productDetailId}
        refreshFlag={refresh} // Sửa ở đây: truyền đúng prop refreshFlag
      /> */}
    </div>
  );
};

export default FeedbackPage;
