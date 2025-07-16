import { useEffect, useState, StrictMode } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

import { Head } from '@inertiajs/react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import WeekArea from '@/Components/CalendarComponents/WeekArea';
import DateArea from '@/Components/CalendarComponents/DateArea';
import IngredientsListModal from '@/Components/CalendarComponents/IngredientsListModal';
import RecipeModal from '@/Components/RecipeModal';

dayjs.locale('ja');

const Calendar = () => {
    const today = dayjs();
    const [thisMonth, setThisMonth] = useState('');
    const [currentYear, setCurrentYear] = useState(today.year());
    const [currentMonth, setCurrentMonth] = useState(today.month() + 1);

    const [mode, setMode] = useState(false);
    const [listArray, setListArray] = useState([]);
    const [ingredientsSumList, setIngredientsSumList] = useState([]);
    const [showIngredientsModal, setShowIngredientsModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs(`${currentYear}-${String(currentMonth).padStart(2, '0')}`));

    const [tabValue, setTabValue] = useState(0);
    const [recipes, setRecipes] = useState([]);
    const [fetchRecipeNames, setFetchRecipeNames] = useState({});
    const [recipeNames, setRecipeNames] = useState({});
    const [memos, setMemos] = useState({});
    const [ingredients, setIngredients] = useState({});

    const [refreshMenus, setRefreshMenus] = useState(false);

    useEffect(() => {
        axios.get('/get_recipes')
            .then((res) => {
                setRecipes(res.data.recipes);
            })
            .catch((err) => {
                console.error('APIエラー:', err);
            })
            .finally(() => {
                setRefreshMenus(false);
            });
    }, [refreshMenus]);

    useEffect(() => {
        axios.get('/calendar/get_menus', {
            params: {
                year: currentYear,
                month: currentMonth,
            }
        })
            .then((res) => {
                const fetchedMenus = res.data.menus;
                if (Array.isArray(fetchedMenus)) {
                    const recipeMap = {};
                    const memoMap = {};
                    const ingredientMap = {};

                    fetchedMenus.forEach(menu => {
                        if (menu.recipe && menu.recipe.name) {
                            const timeOfDay = menu.time_zone_type;
                            if (!recipeMap[menu.date]) {
                                recipeMap[menu.date] = {};
                            }
                            if (!memoMap[menu.date]) {
                                memoMap[menu.date] = {};
                            }
                            if (!ingredientMap[menu.date]) {
                                ingredientMap[menu.date] = {};
                            }
                            recipeMap[menu.date][timeOfDay] = menu.recipe.name;
                            memoMap[menu.date][timeOfDay] = menu.memo;
                            ingredientMap[menu.date][timeOfDay] = menu.recipe.ingredient;
                        }
                    });
                    setFetchRecipeNames(recipeMap);
                    setRecipeNames(recipeMap);
                    setMemos(memoMap);
                    setIngredients(ingredientMap);
                }
            })
            .catch((err) => {
                console.error('APIエラー:', err);
            })
            .finally(() => {
                setRefreshMenus(false);
            });

        const formattedDate = `${currentYear}年${currentMonth}月`;
        setThisMonth(formattedDate);
    }, [currentYear, currentMonth, refreshMenus]);

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

    const changeMonth = (amount) => {
        let newMonth = currentMonth + amount;
        let newYear = currentYear;

        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const changeMode = () => {
        setMode(!mode);
    };

    const changeListArray = (item) => {
        setListArray((prev) => 
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const createList = () => {
        const mergedIngredients = {};

        listArray.forEach(date => {
            const data = ingredients[date];
            if (data) {
                Object.values(data).forEach((items) => {
                    Object.values(items).forEach(({name, amount}) => {
                        if (mergedIngredients[name]) {
                            mergedIngredients[name] += Number(amount);
                        } else {
                            mergedIngredients[name] = Number(amount);
                        }
                    });
                });
            }
        });

        const finalList = Object.entries(mergedIngredients).map(([name, amount]) => ({
            name,
            amount
        }));

        setIngredientsSumList(finalList);
        changeMode(false);
        setShowIngredientsModal(true);
        setListArray([]);
    };

    const handleRegister = async () => {
        try {
            const formatSelectedDate = dayjs(selectedDate).format('YYYY-MM-DD');
            const timeOfDayList = [1, 2, 3];
            const timeOfDay = timeOfDayList[tabValue];
    
            if (!recipeNames?.[formatSelectedDate]?.[timeOfDay]) {
                return alert('レシピ名は必須です');
            }

            if (!ingredients[formatSelectedDate] || !ingredients[formatSelectedDate][timeOfDay]) {
                return alert('材料情報は１つ以上必須です');
            }

            const ingredientList = Object.values(ingredients[formatSelectedDate][timeOfDay]);

            const payload = {
                recipes_id: null,
                date: formatSelectedDate,
                time_zone_type: timeOfDay,
                name: recipeNames[formatSelectedDate][timeOfDay],
                ingredients: ingredientList ?? [],
                memo: memos?.[formatSelectedDate]?.[timeOfDay] ?? null,
            };

            await axios.post('/calendar/menu_post', payload);

            alert('登録に成功しました');
            setShowModal(false);
            setRefreshMenus(true);
        } catch (error) {
            console.error('登録エラー:', error);
            alert('登録に失敗しました');
        }
    };

    return (
        <>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        カレンダー
                    </h2>
                }
            >
                <Head title="Dashboard" />

                <div className="p-4">
                    <div className="calendar-header flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)}>
                            <Icon>keyboard_arrow_left</Icon>
                        </button>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                            <DatePicker
                                label="月を選択"
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
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                        <button onClick={() => changeMonth(1)}>
                            <Icon>keyboard_arrow_right</Icon>
                        </button>
                    </div>

                    <div className="flex m-[16px] leading-[38px]">
                        {mode ? <p className="mr-[8px]">一覧に追加したい日付をクリックしてください</p> : <Button variant="contained" className="border border-black rounded-sm p-[6px]" onClick={() => changeMode()}>
                            必要食材一覧作成
                        </Button>
                        }
                        {mode ? <Button variant="outlined" onClick={() => createList()}>確定</Button> : ''}
                    </div>

                    <div className="grid grid-cols-7 font-bold text-center border border-gray-300 rounded-t-md">
                        {rotatedWeekday.map((day, index) => (
                            <WeekArea key={index} week={day} />
                        ))}
                    </div>

                    <div>
                        <div className="grid grid-cols-7 border-l border-gray-300">
                            {days.map((dayObj, index) => {
                                const todayStr = dayjs().format('YYYY-MM-DD');
                                const isToday = dayObj.date === todayStr;
                                const className = `${isToday ? 'text-red-500 font-bold' : ''} ${dayObj.current ? '' : 'text-gray-400'}`;

                                const recipeNamesForDate = fetchRecipeNames[dayObj.date] || {};
                                const morningRecipe = recipeNamesForDate[1] || '';
                                const afternoonRecipe = recipeNamesForDate[2] || '';
                                const eveningRecipe = recipeNamesForDate[3] || '';

                                return (
                                    <DateArea
                                        key={index}
                                        date={dayjs(dayObj.date).date()}
                                        backGround={listArray.includes(dayObj.date) ? 'bg-blue-200' : ''}
                                        className={className}
                                        onClick={
                                            dayObj.current
                                                ? () => {
                                                    const selected = dayjs(dayObj.date);
                                                    setSelectedDate(selected);

                                                    if (mode) {
                                                        changeListArray(selected.format('YYYY-MM-DD'));
                                                    } else {
                                                        setShowModal(true);
                                                    }
                                                }
                                                : undefined
                                        }
                                    >
                                        <div className="m-[4px]">
                                            {morningRecipe && <div className="border border-black rounded-sm truncate">朝: {morningRecipe}</div>}
                                            {afternoonRecipe && <div className="border border-black rounded-sm truncate">昼: {afternoonRecipe}</div>}
                                            {eveningRecipe && <div className="border border-black rounded-sm truncate">夜: {eveningRecipe}</div>}
                                        </div>
                                    </DateArea>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <IngredientsListModal
                    ingredientsSumList={ingredientsSumList}
                    show={showIngredientsModal}
                    onClose={() => setShowIngredientsModal(false)}
                />

                <RecipeModal
                    selectedDate={dayjs(selectedDate).format('YYYY-MM-DD')}
                    tabValue={tabValue}
                    setTabValue={setTabValue}
                    recipes={recipes}
                    recipeNames={recipeNames}
                    setRecipeNames={setRecipeNames}
                    ingredients={ingredients}
                    setIngredients={setIngredients}
                    memos={memos}
                    setMemos={setMemos}
                    show={showModal}
                    onClose={() => {
                        const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
                        const timeOfDays = [1, 2, 3];

                        timeOfDays.map((timeOfDay) => {
                            const exists = fetchRecipeNames[dateStr]?.[timeOfDay];

                            if (!exists) {
                                setRecipeNames((prev) => ({
                                    ...prev,
                                    [dateStr]: {
                                        ...(prev[dateStr] || {}),
                                        [timeOfDay]: '',
                                    },
                                }));

                                setIngredients((prev) => ({
                                    ...prev,
                                    [dateStr]: {
                                        ...(prev[dateStr] || {}),
                                        [timeOfDay]: [],
                                    },
                                }));

                                setMemos((prev) => ({
                                    ...prev,
                                    [dateStr]: {
                                        ...(prev[dateStr] || {}),
                                        [timeOfDay]: '',
                                    },
                                }));
                            }
                        });

                        setShowModal(false);
                    }}
                    onRegister={handleRegister}
                />
            </AuthenticatedLayout>
        </>
    );
};

export default Calendar;
