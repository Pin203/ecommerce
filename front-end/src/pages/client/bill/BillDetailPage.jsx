import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const BillDetailPage = () => {
  const { id } = useParams(); // id_bill từ URL
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBillDetail = async () => {
      try {
        const response = await axios.get(`/api/bills/${id}`); // API Laravel
        setBill(response.data);
      } catch (err) {
        setError('Không thể tải chi tiết đơn hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetail();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!bill) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{bill.id_bill}</h1>

      <div className="mb-4">
        <p><strong>Người nhận:</strong> {bill.hoten_nguoinhan}</p>
        <p><strong>Địa chỉ:</strong> {bill.diachi_nguoinhan}</p>
        <p><strong>SĐT:</strong> {bill.dienthoai_nguoinhan}</p>
        <p><strong>Phương thức:</strong> {bill.pttt}</p>
        <p><strong>Ngày đặt:</strong> {bill.ngaydat}</p>
        <p><strong>Tổng tiền:</strong> {bill.total.toLocaleString()} VND</p>
      </div>

      <h2 className="text-lg font-semibold mb-2">Danh sách sản phẩm:</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Sản phẩm</th>
            <th className="p-2 border">Số lượng</th>
            <th className="p-2 border">Giá</th>
            <th className="p-2 border">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {bill.details?.map((item, index) => (
            <tr key={index}>
              <td className="p-2 border">{item.product_name || `SP #${item.id_productdetail}`}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">{item.price.toLocaleString()} VND</td>
              <td className="p-2 border">
                {(item.price * item.quantity).toLocaleString()} VND
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillDetailPage;
