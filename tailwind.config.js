import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            // カスタムブレークポイント追加
            screens: {
                'xs': '0px',  // スマホ
                'sm': '600px',  // デフォルト sm
                'md': '900px',  // タブレット横
                'lg': '1200px', // PC
                'xl': '1536px', // 大型画面
            },
        },
    },

    plugins: [],
};
