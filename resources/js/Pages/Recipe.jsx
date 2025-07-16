import { useEffect, useState } from 'react';
import axios from 'axios';

import Button from '@mui/material/Button';

import RecipeCard from '@/Components/RecipeCard';
import RecipeDeleteModal from '@/Components/RecipeDeleteModal';

const Recipe = () => {
    const [recipes, setRecipes] = useState([]);
    const [targetRecipe, setTargetRecipe] = useState({});
    const [anchorElMap, setAnchorElMap] = useState({});
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [expandedCardIds, setExpandedCardIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        axios.get('/get_recipes')
            .then((res) => {
                const fetchedRecipes = res.data.recipes;

                const favoriteIdsFromApi = fetchedRecipes
                    .filter(recipe => recipe.favorite_flg === 1)
                    .map(recipe => recipe.id);

                setRecipes(fetchedRecipes);
                setFavoriteIds(favoriteIdsFromApi);
            })
            .catch((err) => console.error('APIエラー:', err));
    }, []);

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

        const targetRecipe = recipes.find(recipe => recipe.id === id);

        setTargetRecipe(targetRecipe);
        setShowDeleteModal(true);
    };

    const handleFavoriteToggle = async (id) => {
        try {
            setFavoriteIds((prev) =>
                prev.includes(id)
                    ? prev.filter(fid => fid !== id)
                    : [...prev, id]
            );

            await axios.post('/recipe/favorite', {recipe_id: id});
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
            await axios.post('/recipe/delete', { recipe_id: targetRecipe.id });

            setRecipes(prev => prev.filter(recipe => recipe.id !== targetRecipe.id));
            setShowDeleteModal(false);
            alert('削除に成功しました');
        } catch (error) {
            console.log(error);
            alert('レシピの削除に失敗しました');
        }
    };

    return (
        <>
            <Button variant="outlined" onClick={() => movePage(null)}>新規登録</Button>
            <div className="flex justify-center flex-wrap items-start pt-[16px] pl-[16px]">
                {recipes.map(recipe => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        image={recipe.image_path}
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

            <RecipeDeleteModal
                recipeName={targetRecipe?.name}
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={deleteRecipe}
            />
        </>
    );
};

export default Recipe;
