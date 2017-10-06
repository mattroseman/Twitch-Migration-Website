import React, { Component } from 'react';
import SearchBar from './SearchBar/SearchBar.jsx';

export default class ChannelSearch extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    }

    handleSearchChange(newValue) {
        // This is called whenever the text in the input changes
        // probably don't need to do anything but change state
        this.setState({
            value: newValue
        });
    }

    handleSearchSubmit() {
        // this is called when the search button is pressed
    }

    render() {
        return (
            <div className='channel-search'>
                <SearchBar
                    onChange={this.handleSearchChange}
                    onSubmit={this.handleSearchSubmit}
                />
            </div>
        );
    }
}
