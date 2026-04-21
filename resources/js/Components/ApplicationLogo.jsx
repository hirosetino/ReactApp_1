export default function ApplicationLogo(props) {
    return (
        <div>
            <img
                {...props}
                src="/images/logo_circle.webp"
            />
            <h1>Recipe Manager</h1>
        </div>
    );
}
