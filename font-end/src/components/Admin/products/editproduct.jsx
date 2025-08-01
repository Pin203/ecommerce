import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

function EditProductForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        id_category: '',
        id_brand: '',
        description: '',
        technical_specs: '',
        price: '',
        discount: '0',
        is_active: true,
        img: null, // Dùng cho file upload mới của ảnh chính
        current_img_url: '', // Dùng để hiển thị ảnh chính hiện tại và gửi về backend

        img_phu: [], // NEW: Dùng cho file upload mới của ảnh phụ (array of File objects)
        current_img_phu_urls: [], // NEW: Dùng để hiển thị ảnh phụ hiện tại (array of URLs)

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

                const productRes = await axios.get(`${LARAVEL_API_URL}/api/admin/product/${id}`);
                const productData = productRes.data;

                const productDetail = productData.product_details && productData.product_details.length > 0
                                    ? productData.product_details[0]
                                    : {};

                setFormData({
                    name: productData.name || '',
                    id_category: productData.id_category || '',
                    id_brand: productData.id_brand || '',
                    description: productData.description || '',
                    technical_specs: productData.technical_specs || '',
                    price: productData.price || '',
                    discount: productData.discount !== null ? String(productData.discount) : '0',
                    is_active: productData.is_featured === 1,
                    img: null,
                    current_img_url: productData.img || '', // Ảnh chính

                    img_phu: [], // NEW: Reset file inputs for new uploads
                    current_img_phu_urls: productData.img_phu || [], // NEW: Load existing additional images

                    mota: productDetail.mota || '',
                    sl: productDetail.sl !== null ? String(productDetail.sl) : '',
                    id_size: productDetail.id_size || '',
                    id_color: productDetail.id_color || '',
                });

                setSelectedMainFileName(productData.img ? productData.img.split('/').pop() : 'Chưa có tệp nào được chọn');
                setLoading(false);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu sản phẩm hoặc danh mục: ", err);
                setError("Không thể tải dữ liệu sản phẩm hoặc các danh mục/thương hiệu/size/màu sắc. Vui lòng kiểm tra kết nối API và ID sản phẩm.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, LARAVEL_API_URL]);

    const handleChange = (e) => {
        const { id, value, type, name, files } = e.target;

        if (type === 'file') {
            if (id === 'img') { // Main image
                setFormData(prev => ({
                    ...prev,
                    img: files[0],
                    current_img_url: files[0] ? URL.createObjectURL(files[0]) : ''
                }));
                setSelectedMainFileName(files[0] ? files[0].name : 'Chưa có tệp nào được chọn');
            } else if (id === 'img_phu') { // Additional images
                // Limit to 3 files, append to existing ones if any are already selected from this session
                const newFiles = Array.from(files).slice(0, 3);
                setFormData(prev => ({
                    ...prev,
                    img_phu: [...prev.img_phu, ...newFiles].slice(0,3) // Append and re-slice to ensure max 3
                }));
            }
        } else if (name === 'is_featured') {
            setFormData(prev => ({
                ...prev,
                is_active: value === 'true'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };

    // NEW: Handle removal of an individual additional image
    const handleRemoveAdditionalImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            current_img_phu_urls: prev.current_img_phu_urls.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleRemoveSelectedNewAdditionalImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            img_phu: prev.img_phu.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSend = new FormData();
        dataToSend.append('_method', 'PUT');

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

        // Xử lý ảnh chính:
        if (formData.img) {
            dataToSend.append('img', formData.img);
        } else {
            dataToSend.append('current_img', formData.current_img_url === '' ? 'null' : formData.current_img_url);
        }

        // NEW: Xử lý ảnh phụ
        // Gửi các URL ảnh phụ hiện tại (còn lại sau khi xóa)
        formData.current_img_phu_urls.forEach((url, index) => {
            dataToSend.append(`current_img_phu[${index}]`, url);
        });

        // Gửi các file ảnh phụ mới được chọn
        formData.img_phu.forEach((file, index) => {
            dataToSend.append(`img_phu[${index}]`, file);
        });

        try {
            const response = await axios.post(`${LARAVEL_API_URL}/api/admin/product/${id}`, dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Sản phẩm và chi tiết đã được cập nhật thành công:', response.data);
            alert('Cập nhật sản phẩm và chi tiết thành công!');

            // Cập nhật lại state với dữ liệu mới nhất từ backend (bao gồm cả ảnh phụ)
            setFormData(prev => ({
                ...prev,
                current_img_url: response.data.product.img || '',
                current_img_phu_urls: response.data.product.img_phu || [], // Cập nhật ảnh phụ từ response
                img: null, // Đặt lại file ảnh chính đã chọn
                img_phu: [] // Đặt lại file ảnh phụ đã chọn
            }));

            navigate('/admin/viewpro');

        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.message
                                ? err.response.data.message
                                : 'Đã xảy ra lỗi không xác định.';
            alert('Có lỗi xảy ra khi cập nhật sản phẩm: ' + errorMessage + (err.response && err.response.data && JSON.stringify(err.response.data.errors) ? '\nChi tiết: ' + JSON.stringify(err.response.data.errors) : ''));
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
            <h2 className="mb-4 text-gray-800">Chỉnh sửa sản phẩm</h2>

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
                    <h5 className="mb-3 text-gray-700">Chi tiết sản phẩm (Biến thể đầu tiên)</h5>

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

                    {/* Main Image handling for edit form */}
                    <div className="mb-3">
                        <label htmlFor="img" className="form-label">Ảnh sản phẩm chính</label>
                        {formData.current_img_url && (
                            <div className="mb-2 d-flex align-items-center">
                                <img src={formData.current_img_url} alt="Current Product" style={{ maxWidth: '150px', height: 'auto', marginRight: '10px' }} />
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setFormData(prev => ({...prev, current_img_url: '', img: null}))}>Xóa ảnh hiện tại</button>
                            </div>
                        )}
                        <div className="input-group">
                            <input type="file" className="form-control" id="img" onChange={handleChange} accept="image/*" />
                        </div>
                        <small className="form-text text-muted">{selectedMainFileName}</small>
                    </div>

                    {/* NEW: Additional Images handling for edit form */}
                    <div className="mb-3">
                        <label htmlFor="img_phu" className="form-label">Ảnh sản phẩm phụ (Tối đa 3 ảnh)</label>
                        {formData.current_img_phu_urls.length > 0 && (
                            <div className="mb-2 d-flex flex-wrap gap-2">
                                {formData.current_img_phu_urls.map((url, index) => (
                                    <div key={index} className="position-relative">
                                        <img src={url} alt={`Additional ${index}`} style={{ maxWidth: '100px', height: 'auto' }} />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}
                                            onClick={() => handleRemoveAdditionalImage(index)}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                         {formData.img_phu.length > 0 && (
                            <div className="mb-2 d-flex flex-wrap gap-2">
                                {formData.img_phu.map((file, index) => (
                                    <div key={`new-${index}`} className="position-relative">
                                        <img src={URL.createObjectURL(file)} alt={`New Additional ${index}`} style={{ maxWidth: '100px', height: 'auto' }} />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-warning position-absolute top-0 end-0"
                                            style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}
                                            onClick={() => handleRemoveSelectedNewAdditionalImage(index)}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="input-group">
                            <input type="file" className="form-control" id="img_phu" onChange={handleChange} accept="image/*" multiple />
                        </div>
                        <small className="form-text text-muted">
                            {formData.img_phu.length > 0
                                ? formData.img_phu.map(file => file.name).join(', ')
                                : 'Chọn thêm ảnh phụ mới (tối đa 3 ảnh)'}
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
                        <button type="submit" className="btn btn-primary-custom">Cập nhật sản phẩm</button>
                        <button type="button" className="btn btn-secondary-custom" onClick={() => navigate('/admin/viewpro')}>Quay lại danh sách</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProductForm;