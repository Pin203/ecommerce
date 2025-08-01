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
        is_active: true,
        img: null, // For main image file object
        img_phu: [], // NEW: For additional image file objects (array)

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
    const [selectedMainFileName, setSelectedMainFileName] = useState('Chưa có tệp nào được chọn'); // For main image
    const [selectedAdditionalFileNames, setSelectedAdditionalFileNames] = useState([]); // NEW: For additional images

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
            if (id === 'img') { // Main image
                setFormData({ ...formData, img: files[0] });
                setSelectedMainFileName(files[0] ? files[0].name : 'Chưa có tệp nào được chọn');
            } else if (id === 'img_phu') { // Additional images
                // Convert FileList to Array and limit to 3 files
                const newFiles = Array.from(files).slice(0, 3);
                setFormData(prev => ({ ...prev, img_phu: newFiles }));
                setSelectedAdditionalFileNames(newFiles.map(file => file.name));
            }
        } else if (name === 'is_featured') {
            setFormData(prevFormData => ({
                ...prevFormData,
                is_active: value === 'true'
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
        dataToSend.append('is_featured', formData.is_active ? 1 : 0);

        dataToSend.append('mota', formData.mota);
        dataToSend.append('sl', parseInt(formData.sl));
        dataToSend.append('id_size', parseInt(formData.id_size));
        dataToSend.append('id_color', parseInt(formData.id_color));

        // Append main image
        if (formData.img) {
            dataToSend.append('img', formData.img);
        }

        // NEW: Append additional images
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
                name: '', id_category: '', id_brand: '', description: '',
                technical_specs: '', price: '', discount: '0', is_active: true,
                img: null, img_phu: [], // Reset additional images
                mota: '', sl: '', id_size: '', id_color: '',
            });
            setSelectedMainFileName('Chưa có tệp nào được chọn');
            setSelectedAdditionalFileNames([]); // Reset additional file names

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
                    {/* Product Fields */}
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Tên sản phẩm</label>
                        <input type="text" className="form-control" id="name" placeholder="Nhập tên sản phẩm" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="id_category" className="form-label">Danh mục</label>
                        <select className="form-select" id="id_category" value={formData.id_category} onChange={handleChange} required >
                            <option value="" disabled>--- chọn danh mục ---</option>
                            {categories.map((cat) => (<option key={cat.id_category} value={cat.id_category}>{cat.name}</option>))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="id_brand" className="form-label">Thương hiệu sản phẩm</label>
                        <select className="form-select" id="id_brand" value={formData.id_brand} onChange={handleChange} required >
                            <option value="" disabled>--- chọn Thương hiệu ---</option>
                            {brands.map((brand) => (<option key={brand.id_brand} value={brand.id_brand}>{brand.name}</option>))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Mô tả sản phẩm (Chung)</label>
                        <textarea className="form-control" id="description" rows="3" placeholder="Nhập mô tả chung về sản phẩm" value={formData.description} onChange={handleChange} ></textarea>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="technical_specs" className="form-label">Thông số kỹ thuật</label>
                        <textarea className="form-control" id="technical_specs" rows="3" placeholder="Nhập thông số kỹ thuật" value={formData.technical_specs} onChange={handleChange} ></textarea>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="price" className="form-label">Giá</label>
                            <input type="number" className="form-control" id="price" placeholder="Nhập giá" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="discount" className="form-label">% Giảm giá</label>
                            <select className="form-select" id="discount" value={formData.discount} onChange={handleChange} >
                                <option value="0">0%</option>
                                {[5, 10, 15, 20, 25, 30, 40, 50].map(disc => (<option key={disc} value={disc}>{disc}%</option>))}
                            </select>
                        </div>
                    </div>

                    {/* ProductDetail Fields */}
                    <hr className="my-4" />
                    <h5 className="mb-3 text-gray-700">Chi tiết sản phẩm (Biến thể chính)</h5>

                    <div className="mb-3">
                        <label htmlFor="mota" className="form-label">Mô tả chi tiết (cho biến thể)</label>
                        <textarea className="form-control" id="mota" rows="2" placeholder="Nhập mô tả riêng cho biến thể này (vd: chất liệu, đặc điểm riêng)" value={formData.mota} onChange={handleChange} ></textarea>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="sl" className="form-label">Số lượng tồn kho</label>
                            <input type="number" className="form-control" id="sl" placeholder="Nhập số lượng" value={formData.sl} onChange={handleChange} required min="0" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="id_size" className="form-label">Size</label>
                            <select className="form-select" id="id_size" value={formData.id_size} onChange={handleChange} required >
                                <option value="" disabled>--- chọn Size ---</option>
                                {sizes.map((s) => (<option key={s.id_size} value={s.id_size}>{s.name}</option>))}
                            </select>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="id_color" className="form-label">Màu sắc</label>
                            <select className="form-select" id="id_color" value={formData.id_color} onChange={handleChange} required >
                                <option value="" disabled>--- chọn Màu ---</option>
                                {colors.map((c) => (<option key={c.id_color} value={c.id_color}>{c.name}</option>))}
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

                    {/* NEW: Additional Images */}
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

                    <div className="mb-4">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="is_featured" id="is_active_true" value="true" checked={formData.is_active === true} onChange={handleChange} />
                            <label className="form-check-label" htmlFor="is_active_true">Nổi bật (Active)</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="is_featured" id="is_active_false" value="false" checked={formData.is_active === false} onChange={handleChange} />
                            <label className="form-check-label" htmlFor="is_active_false">Không nổi bật (Inactive)</label>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-primary-custom">Thêm sản phẩm</button>
                        <button type="button" className="btn btn-secondary-custom" onClick={() => navigate('/admin/viewpro')}>Quay lại danh sách</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductForm;