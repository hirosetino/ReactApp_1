import { Head, Link, useForm } from '@inertiajs/react';
import { TextField, Button, Checkbox, FormControlLabel, Paper, Box, Typography } from '@mui/material';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="ログイン" />

            <Box
                className="min-h-screen flex items-center justify-center px-4"
            >
                <Paper
                    elevation={3}
                    className="w-full max-w-md p-8 rounded-2xl shadow-md"
                >
                    {/* Logo */}
                    <Box className="text-center mb-6">
                        <img
                            src="/images/logo_circle.png"
                            alt="logo"
                            className="w-20 mx-auto mb-3"
                        />
                        <Typography variant="h5" className="font-bold">
                            cooking pad
                        </Typography>
                    </Box>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
                    )}

                    <form onSubmit={submit}>
                        {/* Email */}
                        <TextField
                            label="メールアドレス"
                            type="email"
                            name="email"
                            fullWidth
                            value={data.email}
                            sx={{ mb: 1 }}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                        />

                        {/* Password */}
                        <TextField
                            label="パスワード"
                            type="password"
                            name="password"
                            fullWidth
                            value={data.password}
                            sx={{ mb: 1 }}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                        />

                        {/* Remember checkbox */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    sx={{
                                        color: "var(--color-orange)",
                                        "&.Mui-checked": {
                                            color: "var(--color-orange)",
                                        },
                                    }}
                                />
                            }
                            label="ログイン状態を保持する"
                            className="text-gray-700"
                        />

                        {/* Forgot password */}
                        {canResetPassword && (
                            <div className="text-right mb-4">
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    パスワードを忘れた場合
                                </Link>
                            </div>
                        )}

                        {/* Login button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={processing}
                            sx={{
                                backgroundColor: "var(--color-orange)",
                                color: "white",
                                py: 1.3,
                                fontSize: "1rem",
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "rgba(255,153,51,0.9)",
                                },
                            }}
                        >
                            ログイン
                        </Button>
                    </form>
                </Paper>
            </Box>
        </GuestLayout>
    );
}
