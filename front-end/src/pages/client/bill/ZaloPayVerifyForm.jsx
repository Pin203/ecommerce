// import React, { useState } from 'react';

// const ZaloPayVerifyForm = ({ onVerified }) => {
//   const [owner, setOwner] = useState('');
//   const [account, setAccount] = useState('');
//   const [status, setStatus] = useState('');
//   const [success, setSuccess] = useState(false);

//   // Danh sách giả lập theo docs
//   const VALID_CARDS = {
//     // ✅ Chỉ 3 thẻ dưới được thanh toán (có đủ số dư)
//     valid: [
//       '9704540000000062',
//       '9704540000000070',
//       '9704540000000088',
//     ],
//     // ❌ Thẻ bị mất hoặc đánh cắp
//     stolen: [
//       '9704540000000013',
//       '9704540000000021',
//       '9704541000000029',
//       '9704541000000052',
//       '9704541000000060',
//       '9704541000000086',
//     ],
//     // ❌ Thẻ bị timeout
//     timeout: [
//       '9704540000000039',
//       '9704541000000037',
//       '9704540000000054',
//     ],
//     // ❌ Thẻ hết tiền
//     no_balance: [
//       '9704540000000047',
//       '9704541000000011',
//       '9704541000000045',
//     ],
//   };

//   const checkCardStatus = (cardNumber, ownerName) => {
//     if (ownerName.toUpperCase() !== 'NGUYEN VAN A') {
//       return { status: '❌ Tên chủ tài khoản không đúng.' };
//     }

//     if (VALID_CARDS.valid.includes(cardNumber)) {
//       return { status: 'Xác minh thành công', success: true };
//     }
//     if (VALID_CARDS.stolen.includes(cardNumber)) {
//       return { status: '❌ Thẻ đã bị mất hoặc đánh cắp.' };
//     }
//     if (VALID_CARDS.timeout.includes(cardNumber)) {
//       return { status: '❌ Kết nối ngân hàng bị timeout. Vui lòng thử lại.' };
//     }
//     if (VALID_CARDS.no_balance.includes(cardNumber)) {
//       return { status: '❌ Tài khoản không đủ số dư.' };
//     }

//     return { status: '❌ Số tài khoản không hợp lệ.' };
//   };

//   const handleVerify = () => {
//     const cardNumber = account.trim();
//     const ownerName = owner.trim().toUpperCase();

//     const result = checkCardStatus(cardNumber, ownerName);
//     setStatus(result.status);
//     setSuccess(!!result.success);

//     if (result.success) {
//       onVerified({
//         zaloAccount: cardNumber,
//         zaloName: ownerName,
//       });
//     }
//   };

//   return (
//     <div className="zalopay-verify-form">
//       <h4>Xác minh tài khoản ZaloPay</h4>
//       <input
//         placeholder="Tên chủ tài khoản (IN HOA)"
//         value={owner}
//         onChange={(e) => setOwner(e.target.value)}
//       />
//       <input
//         placeholder="Số tài khoản (16 số)"
//         value={account}
//         onChange={(e) => setAccount(e.target.value)}
//       />
//       <button onClick={handleVerify}>Xác minh</button>

//       {status && (
//         <p style={{ color: success ? 'green' : 'red', marginTop: 8 }}>{status}</p>
//       )}
//     </div>
//   );
// };

// export default ZaloPayVerifyForm;
