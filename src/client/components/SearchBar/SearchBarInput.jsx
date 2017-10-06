import React, { Component } from 'react';

export default class SearchBarInput extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
    }

    render() {
        return (
            <input
                className="searchbar__input"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({
                        value: event.target.value
                    }, () => {this.props.onChange(this.state.value)});
                }}
            />
        );
    }
}
