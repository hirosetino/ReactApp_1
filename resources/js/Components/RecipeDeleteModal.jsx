import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from "@mui/material";

const RecipeDeleteModal = ({
    recipeName,
    show,
    onClose,
    onDelete,
}) => {
    return (
        <Dialog
            open={show}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>レシピ削除</DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mt: 1 }}>
                    {recipeName
                        ? `${recipeName} を削除してもよろしいですか？`
                        : "このレシピを削除してもよろしいですか？"}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" color="error" onClick={onClose}
                >
                    閉じる
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onDelete}
                >
                    削除
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeDeleteModal;
