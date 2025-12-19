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
    TextField,
    Stack,
} from "@mui/material";

const IngredientsListModal = ({ ingredientsSumList, show, onClose }) => {
    const [checked, setChecked] = useState([]);
    const [list, setList] = useState([]);

    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");

    // 初期化
    useEffect(() => {
        if (show) {
            setList(ingredientsSumList);
            setChecked(ingredientsSumList.map(() => false));
            setNewName("");
            setNewAmount("");
        }
    }, [show, ingredientsSumList]);

    const handleToggle = (index) => {
        setChecked((prev) => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };

    const handleAdd = () => {
        if (!newName.trim()) return;

        setList((prev) => [...prev, { name: newName, amount: newAmount }]);
        setChecked((prev) => [...prev, false]);

        setNewName("");
        setNewAmount("");
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
                {list.length > 0 ? (
                    <List sx={{ py: 0 }}>
                        {list.map((item, index) => (
                            <ListItem key={index} divider disablePadding>
                                <ListItemButton onClick={() => handleToggle(index)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked[index] || false}
                                            disableRipple
                                            sx={{
                                                "&.Mui-checked": {
                                                    color: "var(--color-orange)",
                                                },
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

                {/* 追加フォーム */}
                <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                    <TextField
                        label="材料名"
                        size="small"
                        fullWidth
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <TextField
                        label="量"
                        size="small"
                        sx={{ width: 200 }}
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        sx={{ bgcolor: "var(--color-orange)" }}
                    >
                        追加
                    </Button>
                </Stack>
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
