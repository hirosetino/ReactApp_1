import React from 'react';

import '../../../css/calendar.css';

export default function DateArea({
    data = [],
    date,
    backGround = "",
    className = "",
    onClick,
    children,
    ...props
}) {
    return (
        <div className={`calendar-cell ${backGround}`} onClick={onClick}>
            <p className={`pl-2 ${className}`}>{date}</p>
            {children}
        </div>
    );
}
