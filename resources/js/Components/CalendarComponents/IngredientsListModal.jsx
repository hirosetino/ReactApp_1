import React from 'react';

import Modal from '@/Components/Modal';

const IngredientsListModal = ({ingredientsSumList, show, onClose}) => {

    return (
        <Modal show={show} onClose={onClose}>
            <h2 className="p-[12px] border border-bottom-gray-300 text-lg font-bold">
                必要食材一覧
            </h2>
            <ul className="p-[12px]">
                {ingredientsSumList.length > 0 ? ingredientsSumList?.map((ingredientsSum, index) => {
                    return(
                        <li key={index}>
                            <span>{ingredientsSum.name}</span>
                            <span>{ingredientsSum.amount}</span>
                        </li>
                    );
                }) : '必要食材がありません'}
            </ul>
            <div className="flex justify-end bg-gray-100 p-4 border-t-2 border-solid">
                <button
                    onClick={onClose}
                    className="bg-red-500 text-white mr-4 px-4 py-2 rounded"
                >
                    閉じる
                </button>
            </div>
        </Modal>
    );
};

export default IngredientsListModal;
