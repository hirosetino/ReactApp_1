
import React from 'react';

import '../../../css/calendar.css';

export default function DateArea({
    data = [],
    date,
    cellClass = "calendar-cell",
    backGround = "",
    className = "",
    onClick,
    children,
    ...props
}) {
    return (
        <div
            className={`${cellClass} md:min-h-[8rem] min-h-[4rem] ${backGround}`}
            onClick={onClick}
        >
            <p className={`hidden md:block pl-2 ${className}`}>{date}</p>
            {children}
        </div>
    );
}
