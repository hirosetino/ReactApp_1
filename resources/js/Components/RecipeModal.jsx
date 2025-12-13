// RecipeModal.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Autocomplete,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Button,
    Grid,
    Box
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import dayjs from 'dayjs';

export default function RecipeModal({
    selectedDate,    // "YYYY-MM-DD"
    tabValue,        // 1|2|3
    setTabValue,
    dailyRecipes,
    setDailyRecipes,
    categories,
    recipes,
    show,
    onClose,
    onRegister
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const dateKey = selectedDate;
    const time = Number(tabValue) || 1;

    // ensure structure exists
    const ensureDateTime = () => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey]) updated[dateKey] = { 1: [], 2: [], 3: [] };
            if (!updated[dateKey][time]) updated[dateKey][time] = [];
            // ensure each recipe has the flags
            updated[dateKey][time] = updated[dateKey][time].map(r => ({
                recipes_id: r.recipes_id ?? "",
                name: r.name ?? "",
                category: r.category ?? {id: null, name: ""},
                url: r.url ?? "",
                memo: r.memo ?? "",
                ingredient: Array.isArray(r.ingredient) ? r.ingredient : (r.ingredients ?? []),
                isModified: !!r.isModified,
                isSelectedFromDropdown: !!r.isSelectedFromDropdown,
            }));
            return updated;
        });
    };

    // getter
    const recipesForThisSlot = (dailyRecipes?.[dateKey]?.[time] ?? []).filter(r => !r.isDeleted);

    // add a new empty recipe
    const addRecipe = () => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey]) updated[dateKey] = { 1: [], 2: [], 3: [] };
            if (!updated[dateKey][time]) updated[dateKey][time] = [];
            updated[dateKey][time].push({
                recipes_id: "",
                name: "",
                category: {id: null, name: ""},
                url: "",
                memo: "",
                ingredient: [],
                isModified: true, // new one is treated as modified/new
                isSelectedFromDropdown: false,
            });
            return updated;
        });
    };

    // remove recipe
    const removeRecipe = (index) => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey] || !updated[dateKey][time]) return updated;
            updated[dateKey][time][index].isDeleted = true;
            return updated;
        });
    };

    /**
     * 汎用フィールド更新
     * - 手動編集時に isSelectedFromDropdown が true だったら
     *   → isModified = true, recipes_id = "", isSelectedFromDropdown = false に切替える
     */
    const updateRecipeField = (index, field, value) => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey] || !updated[dateKey][time]) return updated;

            const target = updated[dateKey][time][index];
            if (!target) return updated;

            // set field
            if (Array.isArray(value)) {
                target[field] = [...value];
            } else if (typeof value === 'object' && value !== null) {
                target[field] = { ...value };
            } else {
                target[field] = value;
            }

            return updated;
        });
    };

    // select recipe and auto-insert (選択 → 自動挿入、isSelectedFromDropdown = true)
    const changeSelectRecipe = (index) => (event) => {
        const selectedId = event.target.value;
        // allow clearing selection
        if (!selectedId) {
            // clear selection for that slot
            setDailyRecipes(prev => {
                const updated = structuredClone(prev || {});
                if (!updated[dateKey] || !updated[dateKey][time]) return updated;
                updated[dateKey][time][index] = {
                    ...updated[dateKey][time][index],
                    recipes_id: "",
                    isModified: false,
                    isSelectedFromDropdown: false,
                };
                return updated;
            });
            return;
        }

        const recipe = recipes.find(r => r.id === selectedId);
        if (!recipe) return;

        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey] || !updated[dateKey][time]) return updated;

            // populate fields from selected recipe, but mark as selected-from-dropdown
            updated[dateKey][time][index] = {
                ...updated[dateKey][time][index],
                recipes_id: recipe.id ?? "",
                name: recipe.name ?? "",
                category: recipe.category ?? {id: null, name: ""},
                url: recipe.url ?? "",
                memo: recipe.memo ?? "",
                // accept recipe.ingredient or recipe.ingredients shape
                ingredient: (recipe.ingredient ?? recipe.ingredients ?? []).map(i => ({
                    name: i.name ?? "",
                    amount: i.amount ?? ""
                })),
                isModified: false,
                isSelectedFromDropdown: true,
            };

            return updated;
        });
    };

    // ingredient ops
    const addIngredient = (recipeIndex) => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            if (!updated[dateKey] || !updated[dateKey][time]) return updated;
            const target = updated[dateKey][time][recipeIndex];
            if (!target) return updated;
            target.ingredient = target.ingredient ?? [];
            target.ingredient.push({ name: "", amount: "" });

            return updated;
        });
    };

    const updateIngredient = (recipeIndex, ingIndex, field, value) => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            const target = updated?.[dateKey]?.[time]?.[recipeIndex];
            if (!target) return updated;
            target.ingredient = target.ingredient ?? [];
            if (!target.ingredient[ingIndex]) target.ingredient[ingIndex] = { name: "", amount: "" };

            target.ingredient[ingIndex][field] = value;

            return updated;
        });
    };

    const removeIngredient = (recipeIndex, ingIndex) => {
        setDailyRecipes(prev => {
            const updated = structuredClone(prev || {});
            const target = updated?.[dateKey]?.[time]?.[recipeIndex];
            if (!target) return updated;
            target.ingredient = target.ingredient ?? [];
            target.ingredient.splice(ingIndex, 1);

            return updated;
        });
    };

    React.useEffect(() => {
        if (show) ensureDateTime();
    }, [show, dateKey, time]);

    return (
        <Dialog open={show} onClose={onClose} fullWidth fullScreen={isMobile} maxWidth="md">
            <DialogTitle>{dayjs(dateKey).format('YYYY年MM月DD日')}</DialogTitle>

            <DialogContent dividers>
                <Tabs
                    value={time}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ mb: 2 }}
                    slotProps={{
                        indicator: {
                            sx: {
                                backgroundColor: "var(--color-orange)",
                            },
                        },
                    }}
                >
                    <Tab
                        label="朝"
                        value={1}
                        sx={{
                            "&.Mui-selected": { color: "var(--color-orange)" },
                        }}
                    />
                    <Tab
                        label="昼"
                        value={2}
                        sx={{
                            "&.Mui-selected": { color: "var(--color-orange)" },
                        }}
                    />
                    <Tab
                        label="夜"
                        value={3}
                        sx={{
                            "&.Mui-selected": { color: "var(--color-orange)" },
                        }}
                    />
                </Tabs>

                <Box>
                    {recipesForThisSlot.map((r, idx) => (
                        <Accordion key={idx} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                {r.name || `レシピ ${idx + 1}`}
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container sx={{ width: '100%' }}>
                                    {/* レシピ選択 */}
                                    <FormControl sx={{
                                            width: {
                                                xs: '100%',  // スマホ
                                                sm: '50%',   // PC
                                            },
                                            mb: 2,
                                            "& .MuiInputLabel-root": {
                                                top: "-6px",
                                            },
                                        }}
                                    >
                                        <InputLabel id={`recipe-select-label-${idx}`}>レシピから選択</InputLabel>
                                        <Select
                                            labelId={`recipe-select-label-${idx}`}
                                            label="レシピから選択"
                                            value={r.recipes_id ?? ''}
                                            sx={{
                                                "& .MuiSelect-select": {
                                                    paddingY: "8.5px",   // 上下
                                                    paddingX: "14px",  // 左右
                                                }
                                            }}
                                            onChange={changeSelectRecipe(idx)}
                                        >
                                            <MenuItem value="">未選択</MenuItem>
                                            {recipes?.map(recipe => (
                                                <MenuItem key={recipe.id} value={recipe.id}>
                                                    {recipe.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item sx={{ width: {
                                            xs: '100%',  // スマホ
                                            sm: '50%',   // PC
                                        } }}
                                    >
                                        <TextField
                                            label="レシピ名"
                                            fullWidth
                                            size="small"
                                            value={r.name ?? ''}
                                            onChange={(e) => updateRecipeField(idx, 'name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item sx={{ width: {
                                            xs: '100%',  // スマホ
                                            sm: '50%',   // PC
                                        } }}
                                    >
                                        <Autocomplete
                                            freeSolo
                                            options={categories}
                                            getOptionLabel={(option) => {
                                                if (typeof option === "string") return option;
                                                return option?.name ?? "";
                                            }}
                                            isOptionEqualToValue={(opt, val) =>
                                                opt.id === val.id
                                            }
                                            value={
                                                typeof r.category === "string"
                                                    ? { id: null, name: r.category }
                                                    : r.category || null
                                            }
                                            onInputChange={(event, newInputValue) => {
                                                updateRecipeField(idx, "category", { id: null, name: newInputValue });
                                            }}
                                            onChange={(event, newValue) => {
                                                if (newValue && newValue.name) {
                                                    updateRecipeField(idx, "category", { id: newValue.id, name: newValue.name });
                                                } else {
                                                    updateRecipeField(idx, "category", null);
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
                                    </Grid>
                                    <Grid item sx={{ width: {
                                            xs: '100%',  // スマホ
                                            sm: '50%',   // PC
                                        } }}
                                    >
                                        <TextField
                                            label="URL"
                                            fullWidth
                                            size="small"
                                            value={r.url ?? ''}
                                            onChange={(e) => updateRecipeField(idx, 'url', e.target.value)}
                                        />
                                    </Grid>
                                    {r.url &&
                                        <Link href={r.url} target="_blank" rel="noopener noreferrer">
                                            {r.url}
                                        </Link>
                                    }
                                </Grid>

                                <Grid container spacing={2}>
                                    {/* 材料 */}
                                    <Grid item sx={{ width: '100%' }}>
                                        <Box sx={{ fontWeight: 'bold', my: 1 }}>材料</Box>
                                        {(r.ingredient ?? []).map((ing, ingIdx) => (
                                            <Grid
                                                container
                                                spacing={1}
                                                key={ingIdx}
                                                alignItems="center"
                                                sx={{ mb: 1 }}
                                            >
                                                {/* 材料名: 5 */}
                                                <Grid item sx={{
                                                        width: {
                                                            xs: '45%',
                                                            sm: '25%'
                                                        }
                                                    }}
                                                >
                                                    <TextField
                                                        label="材料名"
                                                        fullWidth
                                                        size="small"
                                                        value={ing.name ?? ''}
                                                        onChange={(e) =>
                                                            updateIngredient(idx, ingIdx, 'name', e.target.value)
                                                        }
                                                    />
                                                </Grid>

                                                {/* 量: 3 */}
                                                <Grid item sx={{
                                                        width: {
                                                            xs: '35%',
                                                            sm: '20%'
                                                        }
                                                    }}
                                                >
                                                    <TextField
                                                        label="量"
                                                        fullWidth
                                                        size="small"
                                                        value={ing.amount ?? ''}
                                                        onChange={(e) =>
                                                            updateIngredient(idx, ingIdx, 'amount', e.target.value)
                                                        }
                                                    />
                                                </Grid>

                                                {/* 削除アイコン: 2 */}
                                                <Grid item sx={{
                                                        width: {
                                                            xs: '10%',
                                                            sm: '5%'
                                                        }
                                                    }}
                                                    textAlign="center"
                                                >
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeIngredient(idx, ingIdx)}
                                                    >
                                                        <RemoveCircleOutlineIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                borderColor: "var(--color-orange)",
                                                color: "var(--color-orange)",
                                            }}
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={() => addIngredient(idx)}
                                        >
                                            材料を追加
                                        </Button>
                                    </Grid>

                                    {/* メモ */}
                                    <Grid item sx={{ width: '100%' }}>
                                        <TextField
                                            label="メモ"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={r.memo ?? ''}
                                            onChange={(e) => updateRecipeField(idx, 'memo', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* レシピ削除 */}
                                <Grid item textAlign="right" sx={{ mt: 2 }}>
                                    <Button color="error" startIcon={<DeleteIcon />} onClick={() => removeRecipe(idx)}>
                                        レシピ削除
                                    </Button>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Button
                        variant="outlined"
                        sx={{
                            mt: 2,
                            borderColor: "var(--color-orange)",
                            color: "var(--color-orange)",
                        }}
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={addRecipe}
                    >
                        レシピを追加
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'right', mt: 3 }}>
                    <Button sx={{ mr: 2 }} variant="outlined" color="error" onClick={onClose}>閉じる</Button>
                    <Button variant="contained" sx={{ backgroundColor: "var(--color-orange)" }} onClick={onRegister}>登録</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
