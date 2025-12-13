import React from 'react';

import { styled } from '@mui/material/styles';
import {
    Card,
    CardHeader,
    CardMedia,
    CardActions,
    CardContent,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Divider,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ExpandMore = styled(({ expanded, ...other }) => (
    <IconButton {...other} />
))(({ theme, expanded }) => ({
    marginLeft: 'auto',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const RecipeCard = ({
    recipe, image,
    anchorEl, onAnchorEl, offAnchorEl, showDeleteModal, movePage,
    favorite, onFavorite,
    expanded, onExpand
}) => {
    return (
        <div className="my-0 mx-auto">
            <Card sx={{ width: '300px' }}>
                <CardHeader
                    action={
                        <>
                            <IconButton onClick={onAnchorEl}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl ?? null}
                                open={Boolean(anchorEl)}
                                onClose={offAnchorEl}
                                MenuListProps={{ sx: { width: '90px', p: 0 } }}
                            >
                                <MenuItem onClick={movePage} sx={{ justifyContent: 'center', p: 1 }}>編集</MenuItem>
                                <MenuItem onClick={showDeleteModal} sx={{ justifyContent: 'center', p: 1, color: 'error.main' }}>削除</MenuItem>
                            </Menu>
                        </>
                    }
                    title={recipe.name}
                    titleTypographyProps={{ fontSize: 16 }}
                />
                <CardMedia
                    component="img"
                    height="194"
                    image={ image ? image : "/images/default.png" }
                    alt="no image"
                    sx={{
                        height: '220px',
                        backgroundSize: 'cover',
                        borderTop: '1px solid #e5e7eb',
                        borderBottom: '1px solid #e5e7eb'
                    }}
                />
                <CardActions disableSpacing>
                    <IconButton onClick={onFavorite}>
                        {favorite ? <StarIcon sx={{ color: "var(--color-orange)" }}/> : <StarOutlineIcon />}
                    </IconButton>
                    <ExpandMore
                        expanded={expanded}
                        onClick={onExpand}
                        aria-expanded={expanded}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={Boolean(expanded)} timeout="auto" unmountOnExit>
                    <CardContent sx={{ paddingTop: '0' }}>
                        <p className="mb-1 font-bold">
                            {recipe.category
                                ? `[${[].concat(recipe.category).map(c => c.name)}]`
                                : ''}
                        </p>
                        <p>材料：</p>
                        {recipe.ingredient?.map((ingredient, index) => (
                            <div key={index} className="flex justify-between">
                                <p>{ingredient.name}</p>
                                <p>{ingredient.amount}</p>
                            </div>
                        ))}
                        {/* <Divider sx={{ marginY: '6px' }}></Divider>
                        <p>レシピ：</p>
                        <Typography>ここにレシピの詳細を表示</Typography> */}
                    </CardContent>
                </Collapse>
            </Card>
        </div>
    );
};

export default RecipeCard;
