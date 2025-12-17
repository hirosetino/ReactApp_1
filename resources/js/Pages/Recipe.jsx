import { useEffect, useState } from 'react';
import axios from 'axios';

import {
    Button,
    Drawer,
    Toolbar,
    Typography,
    Divider,
    TextField,
    InputAdornment,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Layout from '@/Layouts/Layout';
import RecipeCard from '@/Components/RecipeCard';
import RecipeDeleteModal from '@/Components/RecipeDeleteModal';

const Recipe = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [categories, setCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [targetRecipe, setTargetRecipe] = useState({});
    const [anchorElMap, setAnchorElMap] = useState({});
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [expandedCardIds, setExpandedCardIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [onlyFavorite, setOnlyFavorite] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
        vertical: 'top',
        horizontal: 'center',
    });

    // ページごとにレシピ取得（1ページ10件）
    const fetchRecipes = async () => {
        if (loading || !hasMore) return; // 読み込み中 or もうデータがない場合は終了
        setLoading(true);

        try {
            const res = await axios.get('/get_recipes_paginate', {
                params: {
                    page,
                    searchKeyword,
                    onlyFavorite
                }
            });
            const fetchedRecipes = res.data.data;

            setRecipes(prev => [...prev, ...fetchedRecipes]);

            const favoriteIdsFromApi = fetchedRecipes
                .filter(recipe => recipe.favorite_flg === 1)
                .map(recipe => recipe.id);
            setFavoriteIds(prev => [...prev, ...favoriteIdsFromApi]);

            setHasMore(res.data.next_page_url !== null);
            setPage(prev => prev + 1); // 次ページへ
        } catch (err) {
            console.error('APIエラー:', err);
        } finally {
            setLoading(false);
        }
    };

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
        fetchRecipes();
    }, [fetchRecipes]);

    // 無限スクロール
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY; // 上からのスクロール量
            const windowHeight = window.innerHeight; // 画面高さ
            const fullHeight = document.body.offsetHeight; // ページ全体の高さ

            // スクロール位置の割合
            const scrollPosition = (scrollTop + windowHeight) / fullHeight;

            // 70%スクロールしたら次ページを取得
            if (scrollPosition >= 0.7 && hasMore && !loading) {
                fetchRecipes(page);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchRecipes, hasMore, loading, page]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setRecipes([]);

        const fetchFilteredRecipes = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/get_recipes_paginate', {
                    params: {
                        page: 1,
                        searchKeyword,
                        selectedCategories,
                        onlyFavorite
                    }
                });
                setRecipes(res.data.data);

                const favoriteIdsFromApi = res.data.data
                    .filter(recipe => recipe.favorite_flg === 1)
                    .map(recipe => recipe.id);
                setFavoriteIds(favoriteIdsFromApi);

                setHasMore(res.data.next_page_url !== null);
                setPage(2);
            } catch (err) {
                console.error('APIエラー:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredRecipes();
    }, [searchKeyword, selectedCategories, onlyFavorite]);

    const movePage = (id) => {
        if (id !== null) {
            window.location.href = `/recipe/create?id=${id}`;
        } else {
            window.location.href = '/recipe/create';
        }
    };

    const handleMenuOpen = (id, event) => {
        setAnchorElMap(prev => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleMenuClose = (id) => {
        setAnchorElMap(prev => ({ ...prev, [id]: null }));
    };

    const handleSetRecipe = (id) => {
        setAnchorElMap(prev => ({ ...prev, [id]: null }));
        const target = recipes.find(recipe => recipe.id === id);
        setTargetRecipe(target);
        setShowDeleteModal(true);
    };

    const handleFavoriteToggle = async (id) => {
        try {
            setFavoriteIds((prev) =>
                prev.includes(id)
                    ? prev.filter(fid => fid !== id)
                    : [...prev, id]
            );
            await axios.post('/recipe/favorite', { recipe_id: id });
        } catch (error) {
            console.error('お気に入り処理エラー:', error);
            alert('お気に入り処理に失敗しました');
        }
    };

    const handleExpandedCardToggle = (id) => {
        setExpandedCardIds((prev) =>
            prev.includes(id)
                ? prev.filter(fid => fid !== id)
                : [...prev, id]
        );
    };

    const deleteRecipe  = async () => {
        try {
            setIsSubmitting(true);

            await axios.post('/recipe/delete', { recipe_id: targetRecipe.id });
            setRecipes(prev => prev.filter(recipe => recipe.id !== targetRecipe.id));
            setShowDeleteModal(false);

            setSnackbar({
                open: true,
                message: '削除に成功しました',
                severity: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
        } catch (err) {
            console.log('削除エラー', err);

            setSnackbar({
                open: true,
                message: '削除に失敗しました',
                severity: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const searchContent = (
        <Drawer
            variant="permanent"
            anchor="right"
            open
            sx={{
                width: 300,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 300,
                    boxSizing: "border-box",
                },
            }}
        >
            <div className="mt-16">
                <Toolbar>
                    <Typography>検索・絞り込み</Typography>
                </Toolbar>
                <Divider />

                <div className="mx-4">
                    <TextField
                        label="レシピ名や材料名で検索"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mt: 2 }}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />

                    <Autocomplete
                        multiple
                        options={categories}
                        getOptionLabel={(option) => option?.name ?? ""}
                        defaultValue={[]}
                        value={categories.filter(cat => selectedCategories.includes(cat.id))}
                            onChange={(e, newValue) => {
                                setSelectedCategories(newValue.map(cat => cat.id));
                            }}
                        filterSelectedOptions
                        sx={{ mt: 2 }}
                        renderInput={(params) => (
                            <TextField {...params} label="カテゴリ" fullWidth />
                        )}
                    />

                    <FormControlLabel
                        sx={{ mt: 2 }}
                        control={
                            <Checkbox
                                checked={onlyFavorite}
                                sx={{
                                    "&.Mui-checked": { color: "var(--color-orange)" }
                                }}
                                onChange={(e) => setOnlyFavorite(e.target.checked)}
                            />
                        }
                        label="お気に入りのみ表示"
                    />
                </div>
            </div>
        </Drawer>
    );

    const actions = [
        { icon: <FilterAltIcon />, name: 'filter', onClick: () => setShowFilterModal(true) },
        { icon: <PostAddIcon />, name: 'add', onClick: () => movePage(null) },
    ];

    return (
        <Layout isSearch={true} rightContent={searchContent}>
            {!isMobile && <Button
                variant="outlined"
                sx={{
                    borderColor: "var(--color-orange)",
                    color: "var(--color-orange)"
                }}
                onClick={() => movePage(null)}
            >新規登録</Button>}
            <div className="mt-4 mb-0 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
                    {recipes.map((recipe, index) => (
                        <RecipeCard
                            key={`${recipe.id}-${index}`}
                            recipe={recipe}
                            image={recipe.image_url}
                            anchorEl={anchorElMap[recipe.id] || null}
                            onAnchorEl={(e) => handleMenuOpen(recipe.id, e)}
                            offAnchorEl={() => handleMenuClose(recipe.id)}
                            showDeleteModal={() => handleSetRecipe(recipe.id)}
                            movePage={() => movePage(recipe.id)}
                            favorite={favoriteIds.includes(recipe.id)}
                            onFavorite={() => handleFavoriteToggle(recipe.id)}
                            expanded={expandedCardIds.includes(recipe.id)}
                            onExpand={() => handleExpandedCardToggle(recipe.id)}
                        />
                    ))}
                </div>
            </div>

            {loading && <div className="text-center py-4">読み込み中...</div>}

            {isMobile &&
                <SpeedDial
                    ariaLabel="レシピ追加"
                    FabProps={{
                        sx: {
                            backgroundColor: "var(--color-orange)",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "var(--color-orange)",
                                opacity: 0.9,
                            },
                            "&.Mui-focusVisible": {
                                backgroundColor: "var(--color-orange)",
                            },
                            "&:active": {
                                backgroundColor: "var(--color-orange)",
                            },
                            "& .MuiSvgIcon-root": {
                                color: "white !important",
                            },
                            "& .MuiTouchRipple-root span": {
                                backgroundColor: "rgba(255,153,51,0.3)",
                            }
                        }
                    }}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                    }}
                    icon={<SpeedDialIcon />}
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            slotProps={{
                                tooltip: {
                                    title: action.name,
                                },
                            }}
                            onClick={action.onClick}
                        />
                    ))}
                </SpeedDial>
            }

            <RecipeDeleteModal
                recipeName={targetRecipe?.name}
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={deleteRecipe}
            />

            <Dialog open={showFilterModal} onClose={() => setShowFilterModal(false)} fullWidth maxWidth="md">
                <DialogTitle>検索・絞り込み</DialogTitle>

                <DialogContent dividers>
                    <Box>
                        <div className="mx-4">
                            <TextField
                                label="レシピ名や材料名で検索"
                                variant="outlined"
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <Autocomplete
                                multiple
                                options={categories}
                                getOptionLabel={(option) => option?.name ?? ""}
                                defaultValue={[]}
                                value={categories.filter(cat => selectedCategories.includes(cat.id))}
                                    onChange={(e, newValue) => {
                                        setSelectedCategories(newValue.map(cat => cat.id));
                                    }}
                                filterSelectedOptions
                                sx={{ mt: 2 }}
                                renderInput={(params) => (
                                    <TextField {...params} label="カテゴリ" fullWidth />
                                )}
                            />

                            <FormControlLabel
                                sx={{ mt: 2 }}
                                control={
                                    <Checkbox
                                        checked={onlyFavorite}
                                        sx={{
                                            "&.Mui-checked": { color: "var(--color-orange)" }
                                        }}
                                        onChange={(e) => setOnlyFavorite(e.target.checked)}
                                    />
                                }
                                label="お気に入りのみ表示"
                            />
                        </div>
                    </Box>

                    <Box sx={{ textAlign: 'right', mt: 3 }}>
                        <Button variant="outlined" color="error" onClick={() => setShowFilterModal(false)}>閉じる</Button>
                    </Box>
                </DialogContent>
            </Dialog>

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
                    zIndex: 9999,
                }}
                open={isSubmitting}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Layout>
    );
};

export default Recipe;
