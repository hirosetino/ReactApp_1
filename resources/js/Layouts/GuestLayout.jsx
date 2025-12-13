export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgba(255,153,51,.05)] pt-6 sm:justify-center sm:pt-0">
            <div>
                {children}
            </div>
        </div>
    );
}
