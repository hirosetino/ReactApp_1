import React, { useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';

import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Modal from '@/Components/Modal';

const RecipeModal = ({
    selectedDate,
    tabValue,
    setTabValue,
    recipes,
    recipeNames,
    setRecipeNames,
    ingredients,
    setIngredients,
    memos,
    setMemos,
    show,
    onClose,
    onRegister
}) => {
    const [selectRecipes, setSelectRecipes] = useState({});

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
        <Modal show={show} onClose={onClose}>
            <div className="pt-4">
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="朝" />
                    <Tab label="昼" />
                    <Tab label="夜" />
                </Tabs>

                <FormControl sx={{ width: 300, m: 2 }}>
                    <InputLabel id="demo-simple-select-label">レシピ</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="レシピ"
                        value={selectRecipes[selectedDate]?.[timeOfDay] ?? ''}
                        onChange={changeSelectRecipe}
                    >
                        <MenuItem value="">未選択</MenuItem>
                        {recipes?.map((recipe) => {
                            return (
                                <MenuItem key={recipe.id} value={recipe.id}>{recipe.name}</MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                    {[1, 2, 3].map((timeOfDay, idx) => (
                        tabValue === idx && (
                            <div key={timeOfDay} className="max-h-[70vh] overflow-y-auto px-4 pb-4">
                                <h2 className="text-lg font-bold mb-2">
                                    {dayjs(selectedDate).format('YYYY年MM月DD日')} の{timeOfDay === 1 ? '朝' : timeOfDay === 2 ? '昼' : '夜'}のレシピ登録
                                </h2>

                                <input
                                    type="text"
                                    name={`recipe_name_${timeOfDay}`}
                                    value={recipeNames[selectedDate]?.[timeOfDay] ?? ''}
                                    onChange={(e) => {
                                        setRecipeNames((prev) => ({
                                            ...prev,
                                            [selectedDate]: {
                                                ...(prev[selectedDate] || {}),
                                                [timeOfDay]: e.target.value,
                                            },
                                        }));
                                    }}
                                    className="w-full border rounded p-2"
                                    placeholder="レシピ名を入力"
                                />

                                <h2 className="text-lg font-bold my-2">材料入力</h2>
                                {selectedDate &&
                                Array.isArray(ingredients?.[selectedDate]?.[timeOfDay]) &&
                                ingredients[selectedDate][timeOfDay].map((ingredient, key) => (
                                    <div key={key} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={ingredient?.name || ""}
                                            onChange={(e) => {
                                                setIngredients((prev) => {
                                                    const updated = { ...prev };
                                                    updated[selectedDate][timeOfDay][key] = {
                                                        ...updated[selectedDate][timeOfDay][key],
                                                        name: e.target.value,
                                                    };
                                                    return updated;
                                                });
                                            }}
                                            className="border p-1 rounded"
                                            placeholder="材料名を入力"
                                        />
                                        <input
                                            type="text"
                                            value={ingredient?.amount || ""}
                                            onChange={(e) => {
                                                setIngredients((prev) => {
                                                    const updated = { ...prev };
                                                    updated[selectedDate][timeOfDay][key] = {
                                                        ...updated[selectedDate][timeOfDay][key],
                                                        amount: e.target.value,
                                                    };
                                                    return updated;
                                                });
                                            }}
                                            className="border p-1 rounded"
                                            placeholder="量を入力"
                                        />
                                        <CancelPresentationIcon
                                            onClick={() => removeIngredient(key, timeOfDay)}
                                            className="text-red-500 cursor-pointer"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddIngredient(timeOfDay)}
                                    className="text-blue-500 underline"
                                >
                                    入力欄を追加
                                </button>

                                <h2 className="text-lg font-bold mb-2">メモ</h2>
                                <textarea
                                    className="w-full border rounded p-2"
                                    placeholder="メモを入力"
                                    rows={4}
                                    value={memos[selectedDate]?.[timeOfDay] ?? ''}
                                    onChange={(e) => {
                                        setMemos((prev) => ({
                                            ...prev,
                                            [selectedDate]: {
                                                ...(prev[selectedDate] || {}),
                                                [timeOfDay]: e.target.value,
                                            },
                                        }));
                                    }}
                                />
                            </div>
                        )
                    ))}
                </Box>

                <div className="flex justify-end bg-gray-100 p-4 border-t-2 border-solid">
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
                </div>
            </div>
        </Modal>
    );
};

export default RecipeModal;
