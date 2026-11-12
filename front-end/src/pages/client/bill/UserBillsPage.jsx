// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Header from '../../components/client/headers/header';
// import Footer from '../../components/client/footer/footer';
// import { Link } from 'react-router-dom';

// const UserBillsPage = () => {
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

//   const storedUser = localStorage.getItem('user');
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userId = user?.id_user || user?.id || null;

//   useEffect(() => {
//     if (userId) {
//       fetchBills();
//     } else {
//       setLoading(false);
//     }
//   }, [userId]);

//   const fetchBills = async () => {
//     try {
//       const res = await axios.get(`${LARAVEL_API_URL}/api/bill/user/${userId}`);
//       setBills(res.data);
//     } catch (err) {
//       console.error('Lỗi lấy đơn hàng:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (value) => {
//     return Number(value).toLocaleString('vi-VN') + 'đ';
//   };

//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     });
//   };

//   if (!userId) {
//     return (
//       <>
//         <Header />
//         <div className="max-w-2xl mx-auto p-4 text-center">
//           <p className="text-red-600 font-semibold">
//             Bạn cần đăng nhập để xem đơn hàng.
//           </p>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
//         <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử đơn hàng</h2>
//         {loading ? (
//           <p className="text-center text-gray-500">Đang tải đơn hàng...</p>
//         ) : bills.length === 0 ? (
//           <p className="text-center text-gray-600">Bạn chưa có đơn hàng nào.</p>
//         ) : (
//           <table className="w-full table-auto border text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-left">
//                 <th className="border p-2">Mã đơn</th>
//                 <th className="border p-2">Ngày đặt</th>
//                 <th className="border p-2">Tổng tiền</th>
//                 <th className="border p-2">Trạng thái</th>
//                 <th className="border p-2"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {bills.map((bill) => (
//                 <tr key={bill.id_bill} className="hover:bg-gray-50">
//                   <td className="border p-2">#{bill.id_bill}</td>
//                   <td className="border p-2">{formatDate(bill.ngaydat)}</td>
//                   <td className="border p-2">{formatCurrency(bill.total)}</td>
//                   <td className="border p-2">{bill.status || 'Đang xử lý'}</td>
//                   <td className="border p-2 text-blue-600">
//                     <Link to={`/bill-detail/${bill.id_bill}`} className="underline hover:text-blue-800">
//                       Xem chi tiết
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default UserBillsPage;
