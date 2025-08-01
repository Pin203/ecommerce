// components/Modal.js
import React from 'react';

const Modal = ({ show, title, message, onConfirm, onCancel, type = 'alert' }) => {
  if (!show) {
    return null;
  }

  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto animate-fade-in-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          {title}
        </h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className={`flex ${isConfirm ? 'justify-between' : 'justify-end'} space-x-3`}>
          {isConfirm && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Hủy
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isConfirm ? 'Xác nhận' : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

