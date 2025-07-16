import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

import {
    Paper,
    Grid,
    Typography,
    Box,
    TextField,
    InputLabel,
    IconButton,
    Button
} from '@mui/material';

import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

const RecipeCreate = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const recipeId = queryParams.get('id');

    const [recipeData, setRecipeData] = useState({
        recipes_id: null,
        name: '',
        ingredients: [],
        image_path: null,
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();

    useEffect(() => {
        if (recipeId) {
            axios.get(`/get_recipe/${recipeId}`)
                .then((res) => {
                    const r = res.data.recipe;
                    setRecipeData({
                        recipes_id: r.id || null,
                        name: r.name || '',
                        ingredients: r.ingredient || [],
                        image_path: r.image_path || null,
                    });

                    if (r.image_path) {
                        setPreview(`/${r.image_path}`);
                    }
                })
                .catch((err) => {
                    console.error('レシピ取得エラー:', err);
                });
        }
    }, []);

    useEffect(() => {
        if (recipeData.image_path instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(recipeData.image_path);
        }
    }, [recipeData.image_path]);

    const handleIngredientChange = (index, field, value) => {
        const updated = [...recipeData.ingredients];
        updated[index][field] = value;
        setRecipeData(prev => ({ ...prev, ingredients: updated }));
    };

    const handleAddIngredient = () => {
        setRecipeData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', amount: '' }]
        }));
    };

    const handleRemoveIngredient = (index) => {
        const updated = [...recipeData.ingredients];
        updated.splice(index, 1);
        setRecipeData(prev => ({ ...prev, ingredients: updated }));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('recipes_id', recipeData.recipes_id || '');
            formData.append('name', recipeData.name);
            formData.append('image', recipeData.image_path || '');

            recipeData.ingredients.forEach((ing, index) => {
                formData.append(`ingredients[${index}][id]`, ing.id || '');
                formData.append(`ingredients[${index}][name]`, ing.name);
                formData.append(`ingredients[${index}][amount]`, ing.amount);
            });

            await axios.post('/recipe/create_post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('登録に成功しました');
        } catch (error) {
            console.error('登録エラー:', error);
            alert('登録に失敗しました');
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ maxWidth: 800, margin: "auto", mt: 2, padding: 2 }}>
                <Typography variant="h6">
                    {recipeId ? 'レシピ編集' : 'レシピ登録'}
                </Typography>

                <Box mb={2}>
                    <InputLabel>画像</InputLabel>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setRecipeData(prev => ({ ...prev, image_path: file }));

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setPreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />

                    <Box
                        sx={{
                            width: 200,
                            height: 200,
                            border: '1px solid #ccc',
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f9f9f9',
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="プレビュー"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{ color: '#999' }}>画像を選択</span>
                        )}
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    label="レシピ名"
                    size="small"
                    margin="normal"
                    value={recipeData.name}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, name: e.target.value }))}
                />

                <Typography variant="h6" sx={{ mt: 2 }}>
                    材料
                </Typography>

                {recipeData.ingredients?.map((ingredient, index) => (
                    <Grid container mb={1} spacing={2} key={index} alignItems="center">
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                label="材料名"
                                size="small"
                                value={ingredient.name}
                                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                label="量"
                                size="small"
                                value={ingredient.amount}
                                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton
                                onClick={() => handleRemoveIngredient(index)}
                                disabled={recipeData.ingredients.length === 1}
                            >
                                <RemoveCircleOutline />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}

                <Box mt={2}>
                    <Button startIcon={<AddCircleOutline />} onClick={handleAddIngredient}>
                        材料を追加
                    </Button>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        {recipeId ? '更新' : '登録'}
                    </Button>
                </Box>
            </Paper>
        </>
    );
};

export default RecipeCreate;
