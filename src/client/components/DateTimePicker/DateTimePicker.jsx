import React, { Component } from 'react';
import DateTime from 'react-datetime';

export default class DateTimePicker extends Component {
    render() {
        return (
            <div className='datetimepicker'>
                <DateTime />
            </div>
        );
    }
}
