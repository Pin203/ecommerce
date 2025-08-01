// src/components/Admin/comment/AdminCommentList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminCommentList = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_LARAVEL_API_URL}/api/comments/all`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Quản lý bình luận</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sản phẩm</th>
            <th>Người dùng</th>
            <th>Nội dung</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((cmt) => (
            <tr key={cmt.id_comment}>
              <td>{cmt.id_comment}</td>
              <td>{cmt.product?.name}</td>
              <td>{cmt.user?.name}</td>
              <td>{cmt.noidung}</td>
              <td>{cmt.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCommentList;
