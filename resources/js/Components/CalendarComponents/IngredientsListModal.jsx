import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Checkbox,
    Button,
} from "@mui/material";

const IngredientsListModal = ({ ingredientsSumList, show, onClose }) => {
    const [checked, setChecked] = useState([]);

    // show = true になったタイミングで checked を初期化
    useEffect(() => {
        if (show) {
            setChecked(ingredientsSumList.map(() => false));
        }
    }, [show, ingredientsSumList]);

    const handleToggle = (index) => {
        setChecked((prev) => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };

    return (
        <Dialog
            open={show}
            onClose={(e, reason) => {
                if (reason !== "backdropClick") onClose();
            }}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>リスト</DialogTitle>

            <DialogContent dividers sx={{ py: 0 }}>
                {ingredientsSumList.length > 0 ? (
                    <List sx={{ py: 0 }}>
                        {ingredientsSumList.map((item, index) => (
                            <ListItem key={index} divider disablePadding>
                                <ListItemButton onClick={() => handleToggle(index)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked[index] || false}
                                            tabIndex={-1}
                                            disableRipple
                                            sx={{
                                                "&.Mui-checked": { color: "var(--color-orange)" }
                                            }}
                                        />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={item.name}
                                        secondary={item.amount}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <p className="my-8">必要食材がありません</p>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="error">
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IngredientsListModal;
