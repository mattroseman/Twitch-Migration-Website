import React, { Component } from 'react';
import DateTimePicker from './DateTimePicker/DateTimePicker.jsx';
import Slider from './Slider.jsx';

export default class SelectTimeRange extends Component {
    render() {
        return (
            <div className='timerange'>
                <DateTimePicker />
                <Slider />
                <DateTimePicker />
            </div>
        );
    }
}
