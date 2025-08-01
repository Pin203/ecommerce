import api from '../../../services/api';

export default function Logout() {
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Chưa đăng nhập');
    try {
      await api.post('/dangxuat', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      alert('Đã đăng xuất');
    } catch (err) {
      alert('Lỗi đăng xuất');
    }
  };

  return (
    <button onClick={handleLogout}>Đăng xuất</button>
  );
}
