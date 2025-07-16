import React from 'react';

export default function WeekArea({
    week,
    children,
    ...props
}) {
    return (
        <>
            <div className={`${week === '日' ? '' : 'border-r border-gray-300'}`}>
                <p>{week}</p>
            </div>
        </>
    );
}
