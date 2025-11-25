import React, { useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';

import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Grid,
    Tabs,
    Tab,
    TextField,
    InputLabel,
    Link,
    Button,
    MenuItem,
    FormControl,
    Select
} from "@mui/material";

const RecipeModal = ({
    selectedDate,
    tabValue,
    setTabValue,
    recipes,
    selectRecipes,
    setSelectRecipes,
    recipeNames,
    setRecipeNames,
    recipeURLs,
    setRecipeURLs,
    ingredients,
    setIngredients,
    memos,
    setMemos,
    show,
    onClose,
    onRegister
}) => {
    const timeOfDayList = [1, 2, 3];
    const timeOfDay = timeOfDayList[tabValue];

    const changeSelectRecipe = (event) => {
        const selectedId = event.target.value;

        setSelectRecipes((prev) => ({
            ...prev,
            [selectedDate]: {
                ...(prev[selectedDate] || {}),
                [timeOfDay]: selectedId,
            },
        }));

        if (!selectedId) {
            setRecipeNames((prev) => ({
                ...prev,
                [selectedDate]: {
                    ...(prev[selectedDate] || {}),
                    [timeOfDay]: '',
                },
            }));

            setIngredients((prev) => ({
                ...prev,
                [selectedDate]: {
                    ...(prev[selectedDate] || {}),
                    [timeOfDay]: [],
                },
            }));

            return;
        }

        const recipe = recipes.find(r => r.id === selectedId);
        if (!recipe) return;

        setRecipeNames((prev) => ({
            ...prev,
            [selectedDate]: {
                ...(prev[selectedDate] || {}),
                [timeOfDay]: recipe.name || '',
            },
        }));

        setRecipeURLs((prev) => ({
            ...prev,
            [selectedDate]: {
                ...(prev[selectedDate] || {}),
                [timeOfDay]: recipe.url || '',
            },
        }));

        setIngredients((prev) => ({
            ...prev,
            [selectedDate]: {
                ...(prev[selectedDate] || {}),
                [timeOfDay]: recipe.ingredient || [],
            },
        }));
    };

    const handleTabChange = (_, newValue) => {
        setTabValue(newValue);
    };

    const handleAddIngredient = (timeOfDay) => {
        setIngredients((prev) => {
            const prevIngredients = prev[selectedDate]?.[timeOfDay] || [];
            const newIngredient = { name: '', amount: '' };

            return {
                ...prev,
                [selectedDate]: {
                    ...(prev[selectedDate] || {}),
                    [timeOfDay]: [...prevIngredients, newIngredient],
                },
            };
        });
    };

    const removeIngredient = (key, timeOfDay) => {
        setIngredients((prev) => {
            const updated = { ...prev };
            const updatedIngredients = updated[selectedDate]?.[timeOfDay];

            if (updatedIngredients) {
                updatedIngredients.splice(key, 1);
                updated[selectedDate] = {
                    ...updated[selectedDate],
                    [timeOfDay]: [...updatedIngredients],
                };
            }

            return updated;
        });
    };

    return (
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle>
                {dayjs(selectedDate).format("YYYY年MM月DD日")}
            </DialogTitle>

            <DialogContent dividers>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="朝" />
                    <Tab label="昼" />
                    <Tab label="夜" />
                </Tabs>

                <FormControl sx={{ width: 300, mt: 3 }}>
                    <InputLabel id="recipe-select-label">レシピ</InputLabel>
                    <Select
                        labelId="recipe-select-label"
                        label="レシピ"
                        value={selectRecipes[selectedDate]?.[timeOfDay] ?? ''}
                        onChange={changeSelectRecipe}
                    >
                        <MenuItem value="">未選択</MenuItem>
                        {recipes?.map((recipe) => (
                            <MenuItem key={recipe.id} value={recipe.id}>
                                {recipe.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                    {[1, 2, 3].map((timeOfDayValue, idx) => (
                        tabValue === idx && (
                            <Box key={`tod-${selectedDate}-${timeOfDayValue}`}
                                sx={{
                                    maxHeight: "60vh",
                                    overflowY: "auto",
                                    pb: 2,
                                }}
                            >
                                <h2 className="text-lg font-bold mb-2">
                                    {dayjs(selectedDate).format('YYYY年MM月DD日')} の
                                    {timeOfDayValue === 1 ? '朝' : timeOfDayValue === 2 ? '昼' : '夜'}のレシピ登録
                                </h2>

                                <TextField
                                    sx={{ mb: 2 }}
                                    fullWidth
                                    label="レシピ名"
                                    size="small"
                                    value={recipeNames[selectedDate]?.[timeOfDayValue] ?? ''}
                                    onChange={(e) =>
                                        setRecipeNames((prev) => ({
                                            ...prev,
                                            [selectedDate]: {
                                                ...(prev[selectedDate] || {}),
                                                [timeOfDayValue]: e.target.value,
                                            },
                                        }))
                                    }
                                />

                                <TextField
                                    fullWidth
                                    label="URL"
                                    size="small"
                                    value={recipeURLs[selectedDate]?.[timeOfDayValue] ?? ''}
                                    onChange={(e) =>
                                        setRecipeURLs((prev) => ({
                                            ...prev,
                                            [selectedDate]: {
                                                ...(prev[selectedDate] || {}),
                                                [timeOfDayValue]: e.target.value,
                                            },
                                        }))
                                    }
                                />

                                {recipeURLs[selectedDate]?.[timeOfDayValue] && (
                                    <Link
                                        href={recipeURLs[selectedDate][timeOfDayValue]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {recipeURLs[selectedDate][timeOfDayValue]}
                                    </Link>
                                )}

                                <h2 className="text-lg font-bold my-2">材料入力</h2>

                                {selectedDate &&
                                Array.isArray(ingredients?.[selectedDate]?.[timeOfDayValue]) &&
                                ingredients[selectedDate][timeOfDayValue].map((ingredient, index) => (
                                    <Grid
                                        container
                                        mb={1}
                                        spacing={2}
                                        key={`${selectedDate}-${timeOfDayValue}-${index}`}
                                        alignItems="center"
                                    >
                                        <Grid item xs={5}>
                                            <TextField
                                                fullWidth
                                                label="材料"
                                                size="small"
                                                value={ingredient?.name || ""}
                                                onChange={(e) => {
                                                    setIngredients((prev) => {
                                                        const updated = { ...prev };
                                                        updated[selectedDate][timeOfDayValue][index] = {
                                                            ...updated[selectedDate][timeOfDayValue][index],
                                                            name: e.target.value,
                                                        };
                                                        return updated;
                                                    });
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={5}>
                                            <TextField
                                                fullWidth
                                                label="量"
                                                size="small"
                                                value={ingredient?.amount || ""}
                                                onChange={(e) => {
                                                    setIngredients((prev) => {
                                                        const updated = { ...prev };
                                                        updated[selectedDate][timeOfDayValue][index] = {
                                                            ...updated[selectedDate][timeOfDayValue][index],
                                                            amount: e.target.value,
                                                        };
                                                        return updated;
                                                    });
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={2}>
                                            <RemoveCircleOutline
                                                onClick={() => removeIngredient(index, timeOfDayValue)}
                                                className="text-red-500 cursor-pointer"
                                            />
                                        </Grid>
                                    </Grid>
                                ))}

                                <Box mt={2}>
                                    <Button startIcon={<AddCircleOutline />} onClick={() => handleAddIngredient(timeOfDayValue)}>
                                        材料を追加
                                    </Button>
                                </Box>

                                <h2 className="text-lg font-bold mb-2">メモ</h2>
                                <textarea
                                    className="w-full border rounded p-2"
                                    placeholder="メモを入力"
                                    rows={4}
                                    value={memos[selectedDate]?.[timeOfDayValue] ?? ''}
                                    onChange={(e) =>
                                        setMemos((prev) => ({
                                            ...prev,
                                            [selectedDate]: {
                                                ...(prev[selectedDate] || {}),
                                                [timeOfDayValue]: e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </Box>
                        )
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <button
                    onClick={onClose}
                    className="bg-red-500 text-white mr-4 px-4 py-2 rounded"
                >
                    閉じる
                </button>

                <button
                    onClick={onRegister}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    登録
                </button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeModal;
