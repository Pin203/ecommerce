import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons'; // Import các icon cần dùng

function BrandManagement() {
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBrandName, setNewBrandName] = useState('');
    const [editingBrand, setEditingBrand] = useState(null); // State để lưu thông tin brand đang chỉnh sửa

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/brand`);
            setBrands(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải danh sách thương hiệu: ", err);
            setError("Không thể tải danh sách thương hiệu. Vui lòng kiểm tra kết nối API và các route backend.");
            setLoading(false);
        }
    };

    const handleAddBrand = async (e) => {
        e.preventDefault();
        if (!newBrandName.trim()) {
            alert('Tên thương hiệu không được để trống.');
            return;
        }
        try {
            const response = await axios.post(`${LARAVEL_API_URL}/api/admin/brand`, { name: newBrandName });
            setBrands([...brands, response.data]); // Thêm thương hiệu mới vào danh sách
            setNewBrandName(''); // Xóa trường nhập liệu
            alert('Thêm thương hiệu thành công!');
        } catch (err) {
            console.error('Lỗi khi thêm thương hiệu:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.message
                                    ? err.response.data.message
                                    : 'Đã xảy ra lỗi không xác định.';
            alert('Có lỗi xảy ra khi thêm thương hiệu: ' + errorMessage + (err.response && err.response.data && JSON.stringify(err.response.data.errors) ? '\nChi tiết: ' + JSON.stringify(err.response.data.errors) : ''));
        }
    };

    const handleEditClick = (brand) => {
        setEditingBrand({ ...brand }); // Sao chép brand để chỉnh sửa, tránh thay đổi trực tiếp state gốc
    };

    const handleUpdateBrand = async (e) => {
        e.preventDefault();
        if (!editingBrand || !editingBrand.name.trim()) {
            alert('Tên thương hiệu không được để trống.');
            return;
        }
        try {
            const response = await axios.put(`${LARAVEL_API_URL}/api/admin/brand/${editingBrand.id_brand}`, { name: editingBrand.name });
            setBrands(brands.map(brand =>
                brand.id_brand === editingBrand.id_brand ? response.data : brand
            ));
            setEditingBrand(null); // Thoát khỏi chế độ chỉnh sửa
            alert('Cập nhật thương hiệu thành công!');
        } catch (err) {
            console.error('Lỗi khi cập nhật thương hiệu:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.message
                                    ? err.response.data.message
                                    : 'Đã xảy ra lỗi không xác định.';
            alert('Có lỗi xảy ra khi cập nhật thương hiệu: ' + errorMessage + (err.response && err.response.data && JSON.stringify(err.response.data.errors) ? '\nChi tiết: ' + JSON.stringify(err.response.data.errors) : ''));
        }
    };

    const handleDeleteBrand = async (brandId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu này (ID: ${brandId}) không?`)) {
            try {
                await axios.delete(`${LARAVEL_API_URL}/api/admin/brand/${brandId}`);
                setBrands(brands.filter(brand => brand.id_brand !== brandId));
                alert('Xóa thương hiệu thành công!');
            } catch (err) {
                console.error('Lỗi khi xóa thương hiệu:', err.response ? err.response.data : err.message);
                const errorMessage = err.response && err.response.data && err.response.data.message
                                    ? err.response.data.message
                                    : 'Đã xảy ra lỗi không xác định.';
                alert('Có lỗi xảy ra khi xóa thương hiệu: ' + errorMessage + (err.response && err.response.data && JSON.stringify(err.response.data.errors) ? '\nChi tiết: ' + JSON.stringify(err.response.data.errors) : ''));
            }
        }
    };

    if (loading) {
        return (
            <div id="content" className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="ms-2">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div id="content" className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div id="content" className="main-content flex-grow-1 p-4">
            <h2 className="mb-4 text-gray-800">Quản lý Thương hiệu</h2>

            {/* Form Thêm mới Thương hiệu */}
            <div className="form-card card shadow-sm rounded-lg p-4 mb-4">
                <h5 className="mb-3 text-gray-700">Thêm Thương hiệu mới</h5>
                <form onSubmit={handleAddBrand} className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Nhập tên thương hiệu mới"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary-custom d-flex align-items-center">
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Thêm
                    </button>
                </form>
            </div>

            {/* Bảng Danh sách Thương hiệu */}
            <div className="card shadow-sm rounded-lg p-4">
                <h5 className="mb-3 text-gray-700">Danh sách Thương hiệu hiện có</h5>
                <div className="table-responsive">
                    <table className="table table-hover table-striped">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Tên Thương hiệu</th>
                                <th scope="col" className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((brand) => (
                                <tr key={brand.id_brand}>
                                    <td>{brand.id_brand}</td>
                                    <td>
                                        {editingBrand && editingBrand.id_brand === brand.id_brand ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingBrand.name}
                                                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                            />
                                        ) : (
                                            brand.name
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {editingBrand && editingBrand.id_brand === brand.id_brand ? (
                                            <>
                                                <button
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={handleUpdateBrand}
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setEditingBrand(null)}
                                                >
                                                    Hủy
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => handleEditClick(brand)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                {/* <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteBrand(brand.id_brand)}
                                                    title="Xóa"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button> */}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {brands.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center">Chưa có thương hiệu nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BrandManagement;