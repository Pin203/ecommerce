import React from 'react';
import AdminLayout from '../../../layouts/Adminlayout';
import AdminProductList from '../../../components/Admin/products/viewpro';
import CategoryManager from '../../../components/Admin/category/category';
import AddProductForm from '../../../components/Admin/products/creatproduct';



const AdminPage = () => {
    return (
        <>
         <AdminProductList/>
         <CategoryManager/>
         <AddProductForm/>
        </>
    );
};

export default AdminPage;