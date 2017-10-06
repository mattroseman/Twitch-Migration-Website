import React, { Component } from 'react';
import SearchBarInput from './SearchBarInput.jsx';
import SearchBarButton from './SearchBarButton.jsx';

export default class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleInputChange(newValue) {
        this.setState({
            value: newValue
        }, () => {this.props.onChange(this.state.value)});
    }

    handleButtonClick() {
        this.props.onSubmit()
    }

    render() {
        return (
            <div className="searchbar">
                <SearchBarInput onChange={this.handleInputChange}/>
                <SearchBarButton onClick={this.handleButtonClick}/>
            </div>
        );
    }
}
