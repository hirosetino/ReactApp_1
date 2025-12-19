import { useRef, useState, useEffect } from 'react';
import { router } from "@inertiajs/react";
import axios from 'axios';

import {
    Paper,
    Grid,
    Typography,
    Box,
    TextField,
    Link,
    Autocomplete,
    IconButton,
    Button,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';

import { ArrowBackIosNew, AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

import Layout from '@/Layouts/Layout';

const RecipeCreate = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const recipeId = queryParams.get('id');

    const [categories, setCategories] = useState([]);
    const [recipeData, setRecipeData] = useState({
        recipes_id: null,
        name: '',
        url: '',
        ingredients: [],
        image_path: null,
    });

    const [inputValue, setInputValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
        vertical: 'top',
        horizontal: 'center',
    });

    useEffect(() => {
        axios.get('/get_categories')
            .then((res) => {
                const obj = res.data.categories ?? res.data;

                setCategories(obj);
            })
            .catch((err) => {
                console.error('カテゴリ取得エラー:', err);
            });
    }, []);

    useEffect(() => {
        if (recipeId) {
            axios.get(`/get_recipe/${recipeId}`)
                .then((res) => {
                    const r = res.data.recipe;
                    setRecipeData({
                        recipes_id: r.id || null,
                        name: r.name || '',
                        url: r.url || '',
                        ingredients: r.ingredient || [],
                        image_path: r.image_url || null,
                    });

                    if (r.image_url) {
                        setPreview(r.image_url);
                    }

                    if (r.category) {
                        setSelectedCategory({
                            id: r.category.id,
                            name: r.category.name,
                        });
                        setInputValue(r.category.name);
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

    const validateRecipe = () => {
        if (!recipeData.name.trim()) {
            return 'レシピ名を入力してください';
        }

        if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
            return '材料を1つ以上追加してください';
        }

        for (let i = 0; i < recipeData.ingredients.length; i++) {
            const ing = recipeData.ingredients[i];
            if (!ing.name?.trim() || !ing.amount?.trim()) {
                return '材料名と量はすべて入力してください';
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const errorMessage = validateRecipe();
        if (errorMessage) {
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'warning',
                vertical: 'top',
                horizontal: 'center',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            const category = selectedCategory?.id == null ? inputValue : selectedCategory?.id;

            formData.append('recipes_id', recipeData.recipes_id || '');
            formData.append('name', recipeData.name || '');
            formData.append('category', category || null);
            formData.append('url', recipeData.url || '');

            if (recipeData.image_path instanceof File) {
                formData.append('image', recipeData.image_path);
            }

            recipeData.ingredients.forEach((ing, index) => {
                formData.append(`ingredients[${index}][name]`, ing.name);
                formData.append(`ingredients[${index}][amount]`, ing.amount);
            });

            router.post('/recipe/create_post', formData, {
                timeout: 60000,
                onSuccess: () => {},
            });
        } catch (err) {
            console.error('登録エラー', err);

            setSnackbar({
                open: true,
                message: '登録に失敗しました',
                severity: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Layout>
                <IconButton onClick={ () => router.visit("/recipe")}>
                    <ArrowBackIosNew/>
                </IconButton>
                <Paper elevation={3} sx={{ maxWidth: 800, margin: "auto", mt: 1, padding: 2 }}>
                    <Typography variant="h6">
                        {recipeId ? 'レシピ編集' : 'レシピ登録'}
                    </Typography>

                    <Box
                        sx={{
                            position: 'relative',
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
                    >
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                            }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setRecipeData(prev => ({ ...prev, image_path: file }));
                                    const reader = new FileReader();
                                    reader.onloadend = () => setPreview(reader.result);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />

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

                    <TextField
                        fullWidth
                        label="レシピ名"
                        size="small"
                        margin="normal"
                        value={recipeData.name}
                        onChange={(e) => setRecipeData(prev => ({ ...prev, name: e.target.value }))}
                    />

                    <Autocomplete
                        freeSolo
                        options={categories}
                        value={selectedCategory}
                        inputValue={inputValue}
                        getOptionLabel={(option) => option?.name ?? ""}
                        onInputChange={(event, newValue) => {
                            setInputValue(newValue);
                        }}
                        onChange={(event, newValue) => {
                            if (typeof newValue === "string") {
                                setSelectedCategory({ id: null, name: newValue });
                                setInputValue(newValue);
                            } else if (newValue && newValue.name) {
                                setSelectedCategory({ id: newValue.id, name: newValue.name });
                                setInputValue(newValue.name);
                            } else {
                                setSelectedCategory(null);
                                setInputValue("");
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="カテゴリ"
                                placeholder="カテゴリを入力または選択"
                            />
                        )}
                    />

                    <TextField
                        fullWidth
                        label="URL"
                        size="small"
                        margin="normal"
                        value={recipeData.url}
                        onChange={(e) => setRecipeData(prev => ({ ...prev, url: e.target.value }))}
                    />
                    {recipeData.url && (
                        <Link
                            href={recipeData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'block',
                                maxWidth: '100%',
                                wordBreak: 'break-all',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {recipeData.url}
                        </Link>
                    )}

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        材料
                    </Typography>

                    {recipeData.ingredients?.map((ingredient, index) => (
                        <Grid container wrap="nowrap" mb={1} spacing={2} key={index} alignItems="center">
                            <Grid item xs={5} sm={5}>
                                <TextField
                                    fullWidth
                                    label="材料名"
                                    size="small"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={5} sm={5}>
                                <TextField
                                    fullWidth
                                    label="量"
                                    size="small"
                                    value={ingredient.amount}
                                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={2} sm={2} container justifyContent={{ xs: "flex-end", sm: "center" }}>
                                <IconButton color="error" onClick={() => handleRemoveIngredient(index)}>
                                    <RemoveCircleOutline />
                                </IconButton>
                            </Grid>

                        </Grid>
                    ))}

                    <Box mt={2}>
                        <Button
                            sx={{
                                borderColor: "var(--color-orange)",
                                color: "var(--color-orange)",
                            }}
                            startIcon={<AddCircleOutline />}
                            onClick={handleAddIngredient}
                        >
                            材料を追加
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "var(--color-orange)" }}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {recipeId ? '更新' : '登録'}
                        </Button>
                    </Box>
                </Paper>
            </Layout>

            <Snackbar
                anchorOrigin={{ vertical: snackbar.vertical, horizontal: snackbar.horizontal }}
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isSubmitting}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
};

export default RecipeCreate;
