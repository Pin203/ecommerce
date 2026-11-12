import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

function AddProductForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        id_category: '',
        id_brand: '',
        description: '',
        technical_specs: '',
        price: '',
        discount: '0',
        status: 0, // Giá trị mặc định 0 (hiển thị)
        is_featured: false, // Thêm is_featured với giá trị mặc định là false
        img: null,
        img_phu: [],
        // Thuộc tính của ProductDetail
        mota: '',
        sl: '',
        id_size: '',
        id_color: '',
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMainFileName, setSelectedMainFileName] = useState('Chưa có tệp nào được chọn');
    const [selectedAdditionalFileNames, setSelectedAdditionalFileNames] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, brandRes, sizeRes, colorRes] = await Promise.all([
                    axios.get(`${LARAVEL_API_URL}/api/admin/category`),
                    axios.get(`${LARAVEL_API_URL}/api/admin/brand`),
                    axios.get(`${LARAVEL_API_URL}/api/admin/size`),
                    axios.get(`${LARAVEL_API_URL}/api/admin/color`),
                ]);
                setCategories(categoryRes.data);
                setBrands(brandRes.data);
                setSizes(sizeRes.data);
                setColors(colorRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu: ", err);
                setError("Không thể tải danh mục, thương hiệu, size hoặc màu sắc. Vui lòng kiểm tra kết nối API và các route backend.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { id, value, type, name, files } = e.target;

        if (type === 'file') {
            if (id === 'img') {
                setFormData({ ...formData, img: files[0] });
                setSelectedMainFileName(files[0] ? files[0].name : 'Chưa có tệp nào được chọn');
            } else if (id === 'img_phu') {
                const newFiles = Array.from(files).slice(0, 3);
                setFormData(prev => ({ ...prev, img_phu: newFiles }));
                setSelectedAdditionalFileNames(newFiles.map(file => file.name));
            }
        } else if (name === 'status') {
            setFormData(prevFormData => ({
                ...prevFormData,
                status: parseInt(value)
            }));
        } else if (name === 'is_featured') {
            setFormData(prevFormData => ({
                ...prevFormData,
                is_featured: value === 'true' // Chuyển chuỗi "true"/"false" thành boolean
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [id]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('id_category', parseInt(formData.id_category));
        dataToSend.append('id_brand', parseInt(formData.id_brand));
        dataToSend.append('description', formData.description);
        dataToSend.append('technical_specs', formData.technical_specs);
        dataToSend.append('price', parseFloat(formData.price));
        dataToSend.append('discount', formData.discount === '' ? 0 : parseFloat(formData.discount));
        dataToSend.append('is_featured', formData.is_featured ? 1 : 0); // Chuyển boolean thành 1/0 cho backend
        dataToSend.append('status', formData.status);

        dataToSend.append('mota', formData.mota);
        dataToSend.append('sl', parseInt(formData.sl));
        dataToSend.append('id_size', parseInt(formData.id_size));
        dataToSend.append('id_color', parseInt(formData.id_color));

        if (formData.img) {
            dataToSend.append('img', formData.img);
        }

        formData.img_phu.forEach((file, index) => {
            dataToSend.append(`img_phu[${index}]`, file);
        });

        try {
            const response = await axios.post(`${LARAVEL_API_URL}/api/admin/productdetails`, dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Sản phẩm và chi tiết đã được thêm thành công:', response.data);
            alert('Thêm sản phẩm và chi tiết thành công!');
            navigate('/admin/viewpro');

            setFormData({
                name: '',
                id_category: '',
                id_brand: '',
                description: '',
                technical_specs: '',
                price: '',
                discount: '0',
                is_featured: false, // Reset is_featured
                status: 0,
                img: null,
                img_phu: [],
                mota: '',
                sl: '',
                id_size: '',
                id_color: '',
            });
            setSelectedMainFileName('Chưa có tệp nào được chọn');
            setSelectedAdditionalFileNames([]);
        } catch (err) {
            console.error('Lỗi khi thêm sản phẩm:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Đã xảy ra lỗi không xác định.';
            alert('Có lỗi xảy ra khi thêm sản phẩm: ' + errorMessage + (err.response && err.response.data && JSON.stringify(err.response.data.errors) ? '\nChi tiết: ' + JSON.stringify(err.response.data.errors) : ''));
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
            <h2 className="mb-4 text-gray-800">Thêm sản phẩm mới</h2>

            <div className="form-card card shadow-sm rounded-lg p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Tên sản phẩm</label>
                        <input type="text" className="form-control" id="name" placeholder="Nhập tên sản phẩm" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="id_category" className="form-label">Danh mục</label>
                        <select className="form-select" id="id_category" value={formData.id_category} onChange={handleChange} required>
                            <option value="" disabled>--- chọn danh mục ---</option>
                            {categories.map((cat) => (
                                <option key={cat.id_category} value={cat.id_category}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="id_brand" className="form-label">Thương hiệu sản phẩm</label>
                        <select className="form-select" id="id_brand" value={formData.id_brand} onChange={handleChange} required>
                            <option value="" disabled>--- chọn Thương hiệu ---</option>
                            {brands.map((brand) => (
                                <option key={brand.id_brand} value={brand.id_brand}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="price" className="form-label">Giá</label>
                            <input
                                type="number"
                                className="form-control"
                                id="price"
                                placeholder="Nhập giá"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="discount" className="form-label">% Giảm giá</label>
                            <select className="form-select" id="discount" value={formData.discount} onChange={handleChange}>
                                <option value="0">0%</option>
                                {[5, 10, 15, 20, 25, 30, 40, 50].map((disc) => (
                                    <option key={disc} value={disc}>
                                        {disc}%
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-3">
                        <label htmlFor="mota" className="form-label">Mô tả chi tiết</label>
                        <textarea
                            className="form-control"
                            id="mota"
                            rows="2"
                            placeholder="Nhập mô tả riêng cho biến thể này (vd: chất liệu, đặc điểm riêng)"
                            value={formData.mota}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="sl" className="form-label">Số lượng tồn kho</label>
                            <input
                                type="number"
                                className="form-control"
                                id="sl"
                                placeholder="Nhập số lượng"
                                value={formData.sl}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="id_size" className="form-label">Size</label>
                            <select className="form-select" id="id_size" value={formData.id_size} onChange={handleChange} required>
                                <option value="" disabled>--- chọn Size ---</option>
                                {sizes.map((s) => (
                                    <option key={s.id_size} value={s.id_size}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="id_color" className="form-label">Màu sắc</label>
                            <select className="form-select" id="id_color" value={formData.id_color} onChange={handleChange} required>
                                <option value="" disabled>--- chọn Màu ---</option>
                                {colors.map((c) => (
                                    <option key={c.id_color} value={c.id_color}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="mb-3">
                        <label htmlFor="img" className="form-label">Ảnh sản phẩm chính</label>
                        <div className="input-group">
                            <input type="file" className="form-control" id="img" onChange={handleChange} accept="image/*" />
                        </div>
                        <small className="form-text text-muted">{selectedMainFileName}</small>
                    </div>

                    {/* Additional Images */}
                    <div className="mb-3">
                        <label htmlFor="img_phu" className="form-label">Ảnh sản phẩm phụ (Tối đa 3 ảnh)</label>
                        <div className="input-group">
                            <input type="file" className="form-control" id="img_phu" onChange={handleChange} accept="image/*" multiple />
                        </div>
                        <small className="form-text text-muted">
                            {selectedAdditionalFileNames.length > 0
                                ? selectedAdditionalFileNames.join(', ')
                                : 'Chưa có tệp nào được chọn'}
                        </small>
                    </div>

                    {/* Trạng thái sản phẩm */}
                    <div className="mb-4">
                        <label className="form-label">Trạng thái sản phẩm</label>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="status"
                                id="status_0"
                                value="0"
                                checked={formData.status === 0}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="status_0">
                                Hiển thị
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="status"
                                id="status_1"
                                value="1"
                                checked={formData.status === 1}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="status_1">
                                Ẩn
                            </label>
                        </div>
                    </div>

                    {/* Sản phẩm nổi bật */}
                    <div className="mb-4">
                        <label className="form-label">Sản phẩm nổi bật</label>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="is_featured"
                                id="is_featured_true"
                                value="true"
                                checked={formData.is_featured === true}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_featured_true">
                                Có
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="is_featured"
                                id="is_featured_false"
                                value="false"
                                checked={formData.is_featured === false}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_featured_false">
                                Không
                            </label>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-danger">Thêm sản phẩm</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductForm;