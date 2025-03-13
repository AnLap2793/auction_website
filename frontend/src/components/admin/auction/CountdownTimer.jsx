import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import './CountdownTimer.less';

const { Text } = Typography;

const CountdownTimer = ({ endTime, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Check if countdown is complete
            if (Object.keys(newTimeLeft).length === 0) {
                if (onComplete) {
                    onComplete();
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    });

    const formatTime = (value) => {
        return value < 10 ? `0${value}` : value;
    };

    if (Object.keys(timeLeft).length === 0) {
        return <Text className='countdown-ended'>Auction has ended</Text>;
    }

    return (
        <div className='countdown-timer'>
            {timeLeft.days > 0 && (
                <div className='countdown-item'>
                    <div className='countdown-value'>{timeLeft.days}</div>
                    <div className='countdown-label'>Days</div>
                </div>
            )}
            <div className='countdown-item'>
                <div className='countdown-value'>
                    {formatTime(timeLeft.hours)}
                </div>
                <div className='countdown-label'>Hours</div>
            </div>
            <div className='countdown-item'>
                <div className='countdown-value'>
                    {formatTime(timeLeft.minutes)}
                </div>
                <div className='countdown-label'>Minutes</div>
            </div>
            <div className='countdown-item'>
                <div className='countdown-value'>
                    {formatTime(timeLeft.seconds)}
                </div>
                <div className='countdown-label'>Seconds</div>
            </div>
        </div>
    );
};

export default CountdownTimer;
