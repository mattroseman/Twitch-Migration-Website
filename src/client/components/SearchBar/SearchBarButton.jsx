import React, { Component } from 'react';

export default class SearchBarButton extends Component {
    render() {
        return (
            <button
                className="searchbar__button"
                onClick={this.props.onClick}
            />
        );
    }
}
