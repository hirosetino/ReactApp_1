import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
} from "@mui/material";

const IngredientsListModal = ({ ingredientsSumList, show, onClose }) => {
    return (
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>必要食材一覧</DialogTitle>

            <DialogContent dividers>
                {ingredientsSumList.length > 0 ? (
                    <List>
                        {ingredientsSumList.map((item, index) => (
                            <ListItem key={index} divider>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`${item.amount}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    "必要食材がありません"
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="error"
                >
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IngredientsListModal;
