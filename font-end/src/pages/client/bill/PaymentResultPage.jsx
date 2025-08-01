import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  const billId = localStorage.getItem('latest_bill_id');

  useEffect(() => {
    if (!billId) {
      setStatus('unknown');
      return;
    }

    const token = localStorage.getItem('token');
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_LARAVEL_API_URL}/api/bill/${billId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const paymentStatus = res.data?.payment_status;

        if (paymentStatus === 'paid') {
          setStatus('success');
        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          setStatus('failed');
        } else {
          setStatus('pending');

          // Tự động kiểm tra lại sau 5 giây nếu đang pending
          setTimeout(() => {
            checkStatus();
          }, 5000);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    checkStatus();
  }, [billId]);

  const renderStatusMessage = () => {
    switch (status) {
      case 'loading':
        return <p>🔄 Đang kiểm tra thanh toán...</p>;
      case 'success':
        return <p style={{ color: 'green' }}>✅ Thanh toán thành công!</p>;
      case 'failed':
        return <p style={{ color: 'red' }}>❌ Thanh toán thất bại hoặc bị huỷ.</p>;
      case 'pending':
        return <p>🕒 Đơn hàng đang chờ thanh toán... Vui lòng chờ trong giây lát.</p>;
      case 'unknown':
        return <p>⚠️ Không tìm thấy thông tin đơn hàng.</p>;
      case 'error':
      default:
        return <p style={{ color: 'red' }}>❌ Có lỗi xảy ra. Vui lòng thử lại sau.</p>;
    }
  };

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Kết quả thanh toán</h2>
      {billId && <p>Mã đơn hàng: <strong>{billId}</strong></p>}
      {renderStatusMessage()}

      <button
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer',
          borderRadius: 6
        }}
        onClick={() => navigate('/')}
      >
        Quay về trang chủ
      </button>
    </div>
  );
};

export default PaymentStatusPage;
