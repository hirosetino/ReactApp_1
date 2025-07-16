import { useEffect, useState } from "react";

import Box from '@mui/material/Box';

import Modal from '@/Components/Modal';

const RecipeDeleteModal = ({
    recipeName,
    show,
    onClose,
    onDelete,
}) => {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="pt-4">
                <Box sx={{ mt: 2 }}>
                    {recipeName ? `${recipeName}を削除してもよろしいですか？` : 'このレシピを削除してもよろしいですか？'}
                </Box>

                <div className="flex justify-end bg-gray-100 p-4 border-t-2 border-solid">
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white mr-4 px-4 py-2 rounded"
                    >
                        閉じる
                    </button>

                    <button
                        onClick={onDelete}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        削除
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RecipeDeleteModal;
