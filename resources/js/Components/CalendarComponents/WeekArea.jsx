import React from 'react';

export default function WeekArea({
    week,
    className,
    children,
    ...props
}) {
    return (
        <>
            <div className={`${week === '日' ? '' : 'border-r border-gray-300'}`}>
                <p className={className}>{week}</p>
            </div>
        </>
    );
}
