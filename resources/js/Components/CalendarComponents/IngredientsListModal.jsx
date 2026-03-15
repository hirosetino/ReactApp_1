import React, { useState, useRef, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, ListItemIcon, ListItemButton,
    Checkbox, Button, TextField, Stack, ButtonGroup,
    ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList, IconButton
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';

const IngredientsListModal = ({ ingredientsSumList, show, onClose, onSave }) => {
    const [checked, setChecked] = useState([]);
    const [list, setList] = useState([]);

    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");

    const options = ['保存', '編集'];
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0); // ← デフォルトを「保存」に
    const [editMode, setEditMode] = useState(false);

    // 初期化
    useEffect(() => {
        if (show) {
            setList(ingredientsSumList);
            setChecked(ingredientsSumList.map(() => false));
            setNewName("");
            setNewAmount("");
            setEditMode(false);
            setSelectedIndex(0);
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

    // 削除
    const handleDelete = (index) => {
        setList((prev) => prev.filter((_, i) => i !== index));
        setChecked((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);

        if (index === 0) {
            // 「保存」
            onSave(list);
        } else if (index === 1) {
            // 「編集」
            setEditMode(true);
        }
    };

    const handleEdit = (index, field, value) => {
        setList(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    // 編集確定
    const handleConfirmEdit = () => {
        setEditMode(false);
        setSelectedIndex(0);
    };

    const handleOpen = () => setOpen((prev) => !prev);

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) return;
        setOpen(false);
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
                            <ListItem
                                key={index}
                                divider
                                disablePadding
                                secondaryAction={
                                    editMode && (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDelete(index)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )
                                }
                            >
                                {editMode ? (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ width: "100%", pr: 7, py: 2 }}
                                    >
                                        <TextField
                                            value={item.name}
                                            size="small"
                                            fullWidth
                                            onChange={(e) => handleEdit(index, "name", e.target.value)}
                                        />
                                        <TextField
                                            value={item.amount}
                                            size="small"
                                            sx={{ width: 200 }}
                                            onChange={(e) => handleEdit(index, "amount", e.target.value)}
                                        />
                                    </Stack>
                                ) : (
                                    <ListItemButton onClick={() => handleToggle(index)}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={checked[index] || false}
                                                disableRipple
                                                sx={{ "&.Mui-checked": { color: "var(--color-orange)" } }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} secondary={item.amount} />
                                    </ListItemButton>
                                )}
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
                        variant="outlined"
                        sx={{
                            borderColor: "var(--color-orange)",
                            color: "var(--color-orange)",
                            backgroundColor: "#fff",
                        }}
                        onClick={handleAdd}
                    >
                        追加
                    </Button>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="error">
                    閉じる
                </Button>

                {/* 編集モード時のみ「確定」ボタンを表示 */}
                {editMode && (
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "var(--color-orange)",
                            color: "var(--color-orange)",
                            backgroundColor: "#fff",
                        }}
                        onClick={handleConfirmEdit}
                    >
                        確定
                    </Button>
                )}

                {!editMode && (
                    <>
                        <ButtonGroup
                            variant="contained"
                            ref={anchorRef}
                            aria-label="Button group with a nested menu"
                        >
                            <Button
                                sx={{
                                    backgroundColor: "var(--color-orange)",
                                    borderRight: ".5px solid #fff !important"
                                }}
                                onClick={() => {
                                    if (selectedIndex === 0) onSave(list);
                                    else if (selectedIndex === 1) setEditMode(true);
                                }}
                            >
                                {options[selectedIndex]}
                            </Button>
                            <Button
                                size="small"
                                aria-controls={open ? 'split-button-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-label="select merge strategy"
                                aria-haspopup="menu"
                                sx={{ backgroundColor: "var(--color-orange)" }}
                                onClick={handleOpen}
                            >
                                <ArrowDropDownIcon />
                            </Button>
                        </ButtonGroup>

                        <Popper
                            sx={{ zIndex: 1 }}
                            open={open}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            transition
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === 'bottom' ? 'center top' : 'center bottom',
                                    }}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <MenuList id="split-button-menu" autoFocusItem>
                                                {options.map((option, index) => (
                                                    <MenuItem
                                                        key={option}
                                                        selected={index === selectedIndex}
                                                        onClick={(event) => handleMenuItemClick(event, index)}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default IngredientsListModal;
