import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const CategoryManager = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_LARAVEL_API_URL}/api/admin/category`)
      .then(response => setCategories(response.data))
      .catch(error => console.error('Lỗi tải danh mục:', error));
  }, []);

  return (
    <div className="container-fluid mt-4">
      <h2 className="text-center mb-4">Quản lý danh mục sản phẩm</h2>

      {/* Bộ lọc và tìm kiếm như cũ */}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          Danh sách danh mục
          <Link to="/admin/creatcategory" className="btn btn-danger btn-sm">
           <i className="fas fa-plus-circle"></i> Thêm mới
          </Link> 
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>STT</th>
                  {/* <th>Hình ảnh</th> */}
                  <th>Tên danh mục</th>
                  {/* <th>Vị trí</th>
                  <th>Danh mục cha</th> */}
                  {/* <th>Trạng thái</th> */}
                  <th>Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td>{index + 1}</td>
                    {/* <td>
                      <img src="https://via.placeholder.com/60x60?text=IMG" alt="Hình" className="img-thumbnail" />
                    </td> */}
                    <td>{cat.name}</td>
                    {/* <td>
                      <input type="text" className="form-control form-control-sm" value={cat.position || ''} style={{ width: '60px' }} readOnly />
                    </td>
                    <td>{cat.parent_name || 'Không có'}</td> */}
                    {/* <td>
                      <div className="custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" id={`switch${cat.id}`} checked={cat.status} readOnly />
                        <label className="custom-control-label" htmlFor={`switch${cat.id}`}></label>
                      </div>
                    </td> */}
                    <td>
                      <Link to={`/admin/editcategory/${cat.id_category}`}>
                         <button className="btn btn-warning btn-sm">Sửa</button>
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang nếu cần */}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
