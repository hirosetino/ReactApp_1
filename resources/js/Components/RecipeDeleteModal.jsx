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
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="error"
                >
                    閉じる
                </Button>

                <Button
                    onClick={onDelete}
                    variant="contained"
                    color="primary"
                >
                    削除
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeDeleteModal;
