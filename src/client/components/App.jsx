import React, { Component } from 'react';
import ChannelSearch from './ChannelSearch.jsx';
import Graph from './Graph.jsx';
import SelectTimeRange from './SelectTimeRange.jsx';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.handleChannelSearchInput = this.handleChannelSearchInput.bind(this);
    }

    // handleChannelInput is called anytime the search bar for a channel changes
    handleChannelSearchInput(channel) {
    }

    render() {
        return (
            <div>
                <h1>Twitch Migrations</h1>
                <ChannelSearch onChange={this.handleChannelSearchInput}/>
                <Graph />
                <SelectTimeRange />
            </div>
        );
    }
}
