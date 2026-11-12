// ClientLayout.js
import Header from "../components/client/headers/header";
import Banner from "../components/client/banner/banner"; // Bạn sẽ dùng Banner ở nơi khác nếu muốn
import Productnew from "../components/client/product/productnew"; // Bạn sẽ dùng Productnew ở nơi khác
import Footer from "../components/client/footer/footer";
import ProductFlash from "../components/client/product/productSale"; // Bạn sẽ dùng ProductFlash ở nơi khác
import { Outlet } from "react-router-dom";


const ClientLayout = () =>{
    return(
        <>
          <Header />
           <main>
               <Outlet /> {/* <-- Đảm bảo Outlet vẫn ở đây */}
           </main>
           <Footer/>
        </>
    )
}
export default ClientLayout;