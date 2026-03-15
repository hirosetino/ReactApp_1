import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Icon, Button, IconButton, Backdrop, CircularProgress, Snackbar, Alert } from '@mui/material';

import Layout from '@/Layouts/Layout';
import WeekArea from '@/Components/CalendarComponents/WeekArea';
import DateArea from '@/Components/CalendarComponents/DateArea';
import IngredientsListModal from '@/Components/CalendarComponents/IngredientsListModal';
import RecipeModal from '@/Components/RecipeModal';

dayjs.locale('ja');

const Calendar = () => {
    const [isMobile, setIsMobile] = useState(false);

    const today = dayjs();
    const [currentYear, setCurrentYear] = useState(today.year());
    const [currentMonth, setCurrentMonth] = useState(today.month() + 1);

    const [mode, setMode] = useState(false);
    const [listArray, setListArray] = useState([]);
    const [ingredientsSumList, setIngredientsSumList] = useState([]);
    const [showIngredientsModal, setShowIngredientsModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`));

    // tab (1=朝,2=昼,3=夜)
    const [tabValue, setTabValue] = useState(1);

    const [categories, setCategories] = useState([]);

    const [recipes, setRecipes] = useState([]);

    const [dailyRecipes, setDailyRecipes] = useState({});

    const [refreshMenus, setRefreshMenus] = useState(false);

    const pickerRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
        vertical: 'top',
        horizontal: 'center',
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const weekday = ["日", "月", "火", "水", "木", "金", "土"];
    const startWeek = 1;
    const rotatedWeekday = [...weekday.slice(startWeek), ...weekday.slice(0, startWeek)];

    const firstDay = dayjs(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    const firstWeekDay = firstDay.day();
    const offset = (firstWeekDay - startWeek + 7) % 7;
    const lastDay = firstDay.endOf('month').date();

    const prevMonthDate = firstDay.subtract(1, 'month').endOf('month');
    const prevMonthLastDay = prevMonthDate.date();
    const prevMonth = prevMonthDate.month() + 1;
    const prevYear = prevMonthDate.year();

    const nextMonthDate = firstDay.add(1, 'month').startOf('month');
    const nextMonth = nextMonthDate.month() + 1;
    const nextYear = nextMonthDate.year();

    const totalCells = 42;
    const nextMonthDaysCount = totalCells - (offset + lastDay);

    const days = [
        ...Array.from({ length: offset }, (_, i) => {
            const day = prevMonthLastDay - offset + i + 1;
            return {
                date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                current: false,
            };
        }),
        ...Array.from({ length: lastDay }, (_, i) => {
            const day = i + 1;
            return {
                date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                current: true,
            };
        }),
        ...Array.from({ length: nextMonthDaysCount }, (_, i) => {
            const day = i + 1;
            return {
                date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                current: false,
            };
        })
    ];

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

    // fetch recipe library (optional)
    useEffect(() => {
        axios.get('/get_recipes')
            .then(res => setRecipes(res.data.recipes || []))
            .catch(err => console.error('get_recipes error', err));
    }, [refreshMenus]);

    // fetch menus (API returns rows: 1 row = 1 menu/recipe)
    useEffect(() => {
        const startDate = days[0].date;
        const endDate = days[days.length - 1].date;

        axios.get('/calendar/get_menus', {
            params: { startDate: startDate, endDate: endDate }
        })
            .then(res => {
                const fetchedMenus = res.data.menus || [];
                // build dailyRecipes
                const next = {};
                fetchedMenus.forEach(menu => {
                    // menu: { date, time_zone_type, memo, recipes_id, recipe: { id, name, ingredient: [...] } }
                    const dateKey = menu.date;
                    const time = Number(menu.time_zone_type) || 1;

                    if (!next[dateKey]) next[dateKey] = { 1: [], 2: [], 3: [] };
                    // transform to front recipe structure
                    const recipeObj = {
                        recipes_id: menu.recipes_id ?? (menu.recipe?.id ?? null),
                        name: menu.recipe?.name ?? '',
                        category: menu.recipe?.category ?? null,
                        url: menu.recipe?.url ?? '', // backend doesn't return url, left empty
                        memo: menu.memo ?? '',
                        ingredient: (menu.recipe?.ingredient || []).map(ing => ({
                            // backend ingredient has { name, amount }
                            name: ing.name ?? '',
                            amount: ing.amount ?? '',
                        })),
                        isModified: false,
                        isSelectedFromDropdown: false,
                    };
                    next[dateKey][time].push(recipeObj);
                });
                setDailyRecipes(next);
            })
            .catch(err => console.error('get_menus error', err))
            .finally(() => setRefreshMenus(false));
        const formattedDate = `${currentYear}年${currentMonth}月`;
    }, [currentYear, currentMonth, refreshMenus]);

    const changeMonth = (amount) => {
        let newMonth = currentMonth + amount;
        let newYear = currentYear;
        if (newMonth < 1) { newMonth = 12; newYear--; }
        else if (newMonth > 12) { newMonth = 1; newYear++; }
        const newDate = dayjs(`${newYear}-${String(newMonth).padStart(2, '0')}-01`);
        setSelectedDate(newDate);
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const changeMode = () => setMode(prev => !prev);

    const changeListArray = (item) => {
        setListArray(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    // create shopping list from dailyRecipes
    const parseAmount = (raw) => {
        if (!raw || typeof raw !== 'string') return null;

        const str = raw.trim();

        // 数字のみ（1 / 1.5）
        let m = str.match(/^(\d+(?:\.\d+)?)$/);
        if (m) {
            return { value: parseFloat(m[1]), unit: '' };
        }

        // 1.5g / 1.5 g
        m = str.match(/^(\d+(?:\.\d+)?)[\s]*(.+)$/);
        if (m) {
            return { value: parseFloat(m[1]), unit: m[2].trim() };
        }

        // g1.5 / g 1.5
        m = str.match(/^(.+?)[\s]*(\d+(?:\.\d+)?)$/);
        if (m) {
            return { value: parseFloat(m[2]), unit: m[1].trim() };
        }

        return null;
    };

    const createList = () => {
        const mergedIngredients = {};

        listArray.forEach(date => {
            const day = dailyRecipes[date];
            if (!day) return;

            [1, 2, 3].forEach(t => {
                (day[t] || []).forEach(recipe => {
                    (recipe.ingredient || []).forEach(({ name, amount }) => {
                        const parsed = parseAmount(amount);
                        if (!parsed) return;

                        const { value, unit } = parsed;

                        if (!mergedIngredients[name]) {
                            mergedIngredients[name] = {};
                        }
                        if (!mergedIngredients[name][unit]) {
                            mergedIngredients[name][unit] = 0;
                        }

                        mergedIngredients[name][unit] += value;
                    });
                });
            });
        });

        const finalList = Object.entries(mergedIngredients).map(
            ([name, unitMap]) => {
                const amountStr = Object.entries(unitMap)
                    .map(([unit, value]) => {
                        // 小数誤差対策（最大2桁）
                        const rounded = Math.round(value * 100) / 100;
                        return `${rounded}${unit}`;
                    })
                    .join('、');

                return { name, amount: amountStr };
            }
        );

        setIngredientsSumList(finalList);
        setMode(false);
        setShowIngredientsModal(true);
        setListArray([]);
    };

    const saveIngredientsList = async (list) => {
        try {
            const payload = {
                lists: list,
            };

            await axios.post('/lists_post', payload);

            setSnackbar({
                open: true,
                message: '保存に成功しました',
                severity: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
            setShowIngredientsModal(false);
        } catch (err) {
            console.error('保存エラー', err);
            setSnackbar({
                open: true,
                message: '保存に失敗しました',
                severity: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
        }
    };

    const getLists = () => {
        axios.get('/get_lists')
            .then((res) => {
                const obj = res.data.lists ?? res.data;

                setIngredientsSumList(obj);
                setMode(false);
                setShowIngredientsModal(true);
                setListArray([]);
            })
            .catch((err) => {
                console.error('リスト取得エラー:', err);
            });
    }

    // handle register (POST multiple recipes)
    const handleRegister = async () => {
        try {
            setIsSubmitting(true);

            const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
            const dayMenus = dailyRecipes?.[dateKey];

            // 対象日付にメニューがない
            if (!dayMenus) {
                setSnackbar({
                    open: true,
                    message: 'レシピが入力されていません',
                    severity: 'warning',
                    vertical: 'top',
                    horizontal: 'center',
                });
                return;
            }

            // 朝・昼・夜をまとめてチェック
            const allRecipes = [
                ...(dayMenus[1] || []),
                ...(dayMenus[2] || []),
                ...(dayMenus[3] || []),
            ].filter(r => !r?.isDeleted);

            // レシピが1つもない
            if (allRecipes.length === 0) {
                setSnackbar({
                    open: true,
                    message: 'レシピを1つ以上入力してください',
                    severity: 'warning',
                    vertical: 'top',
                    horizontal: 'center',
                });
                return;
            }

            // レシピ名 or 材料チェック
            for (const recipe of allRecipes) {
                if (!recipe.name || recipe.name.trim() === '') {
                    setSnackbar({
                        open: true,
                        message: 'レシピ名が未入力です',
                        severity: 'warning',
                        vertical: 'top',
                        horizontal: 'center',
                    });
                    return;
                }

                if (!recipe.ingredient || recipe.ingredient.length === 0) {
                    setSnackbar({
                        open: true,
                        message: `「${recipe.name}」の材料が未入力です`,
                        severity: 'warning',
                        vertical: 'top',
                        horizontal: 'center',
                    });
                    return;
                }

                const hasEmptyIngredient = recipe.ingredient.some(
                    i => !i.name || i.name.trim() === ''
                );

                if (hasEmptyIngredient) {
                    setSnackbar({
                        open: true,
                        message: `「${recipe.name}」の材料名が未入力です`,
                        severity: 'warning',
                        vertical: 'top',
                        horizontal: 'center',
                    });
                    return;
                }
            }

            // 朝・昼・夜まとめて送信する構造にする
            const menusForPost = {
                1: (dailyRecipes?.[dateKey]?.[1] || [])
                    .filter(r => !Boolean(r?.isDeleted))
                    .map(r => ({
                        recipes_id: r.recipes_id || null,
                        name: r.name,
                        category: r.category,
                        url: r.url || null,
                        memo: r.memo || null,
                        ingredients: (r.ingredient || []).map(i => ({
                            name: i.name,
                            amount: i.amount
                        }))
                    })),
                2: (dailyRecipes?.[dateKey]?.[2] || [])
                    .filter(r => !Boolean(r?.isDeleted))
                    .map(r => ({
                        recipes_id: r.recipes_id || null,
                        name: r.name,
                        category: r.category,
                        url: r.url || null,
                        memo: r.memo || null,
                        ingredients: (r.ingredient || []).map(i => ({
                            name: i.name,
                            amount: i.amount
                        }))
                    })),
                3: (dailyRecipes?.[dateKey]?.[3] || [])
                    .filter(r => !Boolean(r?.isDeleted))
                    .map(r => ({
                        recipes_id: r.recipes_id || null,
                        name: r.name,
                        category: r.category,
                        url: r.url || null,
                        memo: r.memo || null,
                        ingredients: (r.ingredient || []).map(i => ({
                            name: i.name,
                            amount: i.amount
                        }))
                    })),
            };

            const payload = {
                date: dateKey,
                menus: menusForPost,
            };

            await axios.post('/calendar/menu_post', payload);
            setSnackbar({
                open: true,
                message: '登録に成功しました',
                severity: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
            setShowModal(false);
            setRefreshMenus(true);
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
                <>
                    <div className="calendar-header flex justify-start items-center mb-4">
                        <IconButton onClick={() => changeMonth(-1)}><Icon>keyboard_arrow_left</Icon></IconButton>
                        <IconButton onClick={() => changeMonth(1)}><Icon>keyboard_arrow_right</Icon></IconButton>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                            <div className="inline-block relative ml-4">
                                {/* 非表示 DatePicker */}
                                <DatePicker
                                    views={['month', 'year']}
                                    format="YYYY年MM月"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        if (newValue?.isValid?.()) {
                                            setSelectedDate(newValue);
                                            setCurrentYear(newValue.year());
                                            setCurrentMonth(newValue.month() + 1);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            sx: {
                                                opacity: 0,
                                                pointerEvents: "none",
                                                position: "absolute",
                                                inset: 0,
                                                width: "100%",
                                                height: "100%",
                                            },
                                        },
                                    }}
                                    ref={pickerRef}
                                />

                                {/* 表示用文字 */}
                                <span
                                    onClick={() => pickerRef.current?.querySelector('button')?.click()}
                                    className="cursor-pointer text-xl font-bold select-none block"
                                >
                                    {selectedDate.format("YYYY年MM月")}
                                </span>
                            </div>
                        </LocalizationProvider>
                    </div>

                    <div
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 10, // Dialog / Backdrop より下にする
                            display: 'flex',
                            gap: 8,
                        }}
                    >
                        {!mode && (
                            <>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "var(--color-orange)",
                                        borderRadius: 999,
                                        px: 3,
                                    }}
                                    onClick={changeMode}
                                >
                                    リスト作成
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: "var(--color-orange)",
                                        color: "var(--color-orange)",
                                        backgroundColor: "#fff",
                                        borderRadius: 999
                                    }}
                                    onClick={getLists}
                                >
                                    リスト呼び出し
                                </Button>
                            </>
                        )}

                        {mode && (
                            <>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: "var(--color-orange)",
                                        color: "var(--color-orange)",
                                        borderRadius: 999,
                                        px: 3,
                                        backgroundColor: "#fff",
                                    }}
                                    onClick={createList}
                                >
                                    確定
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    sx={{
                                        borderRadius: 999,
                                        px: 3,
                                        backgroundColor: "#fff",
                                    }}
                                    onClick={changeMode}
                                >
                                    キャンセル
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="hidden md:grid grid-cols-7 text-center border border-gray-300 rounded-t-md">
                        {rotatedWeekday.map((day, index) => {
                            const className = `${day === '日' ? 'text-red-500' : day === '土' ? 'text-blue-500' : ''}`;
                            return (
                                <WeekArea key={index} week={day} className={className} />
                            )
                        })}
                    </div>
                    <div className="block md:hidden border-b border-gray-300"></div>

                    <div>
                        <div className="grid md:grid-cols-7 grid-cols-1 border-l border-gray-300">
                            {days.map((dayObj, index) => {
                                const todayStr = dayjs().format('YYYY-MM-DD');
                                const isToday = dayObj.date === todayStr;
                                const backGround = `${isToday ? 'bg-today' : ''}`;
                                const className = `${dayObj.current ? '' : 'text-gray-400'}`;

                                // show first recipe names (join up to 3)
                                const dayRecipes = dailyRecipes[dayObj.date] ?? { 1: [], 2: [], 3: [] };

                                // 朝 (1)
                                const morningRecipe = (dayRecipes[1] ?? [])
                                    .map(r => r.name)
                                    .filter(Boolean)
                                    .join(' / ');

                                // 昼 (2)
                                const afternoonRecipe = (dayRecipes[2] ?? [])
                                    .map(r => r.name)
                                    .filter(Boolean)
                                    .join(' / ');

                                // 夜 (3)
                                const eveningRecipe = (dayRecipes[3] ?? [])
                                    .map(r => r.name)
                                    .filter(Boolean)
                                    .join(' / ');

                                const weekdayLabel = dayjs(dayObj.date).format("dd");
                                const classNameMobile = `${weekdayLabel === '日' ? 'text-red-500' : weekdayLabel === '土' ? 'text-blue-500' : 'text-gray-500'}`;

                                const tagBase = "my-[4px] text-xs px-2 py-0.5 rounded-full font-medium";

                                return (
                                    <DateArea
                                        key={index}
                                        date={dayjs(dayObj.date).date()}
                                        cellClass={isMobile ? 'calendar-cell-mobile' : 'calendar-cell'}
                                        backGround={listArray.includes(dayObj.date) ? 'bg-yellow-100' : backGround}
                                        className={className}
                                        onClick={() => {
                                            const selected = dayjs(dayObj.date);
                                            setSelectedDate(selected);
                                            if (mode) {
                                                changeListArray(selected.format('YYYY-MM-DD'));
                                            } else {
                                                setShowModal(true);
                                                setTabValue(1);
                                            }
                                        }
                                        }
                                    >
                                        {/* 📱 スマホ版：曜日＋日付 + レシピ */}
                                        <div className="md:hidden m-[4px]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className={`text-sm ${classNameMobile}`}>{weekdayLabel}</span>
                                                <span className={`text-md ${className}`}>{dayjs(dayObj.date).date()}</span>
                                            </div>

                                            {morningRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--morning-bg)",
                                                        color: "var(--morning-text)",
                                                    }}
                                                >
                                                    朝 {morningRecipe}
                                                </div>
                                            )}

                                            {afternoonRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--lunch-bg)",
                                                        color: "var(--lunch-text)",
                                                    }}
                                                >
                                                    昼 {afternoonRecipe}
                                                </div>
                                            )}

                                            {eveningRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--dinner-bg)",
                                                        color: "var(--dinner-text)",
                                                    }}
                                                >
                                                    夜 {eveningRecipe}
                                                </div>
                                            )}
                                        </div>

                                        {/* 🖥 PC版：今までどおり */}
                                        <div className="hidden md:block m-[4px]">
                                            {morningRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--morning-bg)",
                                                        color: "var(--morning-text)",
                                                    }}
                                                >
                                                    朝 {morningRecipe}
                                                </div>
                                            )}

                                            {afternoonRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--lunch-bg)",
                                                        color: "var(--lunch-text)",
                                                    }}
                                                >
                                                    昼 {afternoonRecipe}
                                                </div>
                                            )}

                                            {eveningRecipe && (
                                                <div
                                                    className={tagBase}
                                                    style={{
                                                        backgroundColor: "var(--dinner-bg)",
                                                        color: "var(--dinner-text)",
                                                    }}
                                                >
                                                    夜 {eveningRecipe}
                                                </div>
                                            )}
                                        </div>
                                    </DateArea>
                                );
                            })}
                        </div>
                    </div>
                </>
            </Layout>

            <IngredientsListModal
                ingredientsSumList={ingredientsSumList}
                show={showIngredientsModal}
                onClose={() => setShowIngredientsModal(false)}
                onSave={saveIngredientsList}
            />

            <RecipeModal
                selectedDate={dayjs(selectedDate).format('YYYY-MM-DD')}
                tabValue={tabValue}
                setTabValue={setTabValue}
                dailyRecipes={dailyRecipes}
                setDailyRecipes={setDailyRecipes}
                categories={categories}
                recipes={recipes}
                show={showModal}
                onClose={() => setShowModal(false)}
                onRegister={handleRegister}
            />

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
        </>
    );
};

export default Calendar;
