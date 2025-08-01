import { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function AccountList() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/user');
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id_user);
    setFormData(user);
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/admin/user/${editingUserId}`, formData);
      fetchUsers();
      setEditingUserId(null);
    } catch (error) {
      console.error('Cập nhật lỗi:', error);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await api.put(`/admin/user/${id}/toggle-block`);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi chặn/bỏ chặn user:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Danh sách tài khoản</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Quyền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_user}>
              <td>
                {editingUserId === user.id_user ? (
                  <input name="username" value={formData.username} onChange={handleChange} />
                ) : (
                  user.username
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <input name="name" value={formData.name} onChange={handleChange} />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <input name="email" value={formData.email} onChange={handleChange} />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <input name="dienthoai" value={formData.dienthoai} onChange={handleChange} />
                ) : (
                  user.dienthoai
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <input name="diachi" value={formData.diachi} onChange={handleChange} />
                ) : (
                  user.diachi
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {user.is_blocked ? (
                  <span className="text-danger">Đã chặn</span>
                ) : (
                  <span className="text-success">Hoạt động</span>
                )}
              </td>
              <td>
                {editingUserId === user.id_user ? (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>
                      Lưu
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(user)}>
                      Sửa
                    </button>
                    <button
                      className={`btn btn-${user.is_blocked ? 'warning' : 'danger'} btn-sm`}
                      onClick={() => handleToggleBlock(user.id_user)}
                    >
                      {user.is_blocked ? 'Bỏ chặn' : 'Chặn'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
