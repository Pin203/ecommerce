import React from 'react';
import Banner from '../../../components/client/banner/banner';
import Productnew from '../../../components/client/product/productnew';
import ProductFlash from '../../../components/client/product/productSale';
import Productnb from '../../../components/client/product/producnb';

const HomePage = () => {
    return (
        <>
            <Banner />
            <Productnew />
            <ProductFlash />
            <Productnb/>
        </>
    );
};

export default HomePage;