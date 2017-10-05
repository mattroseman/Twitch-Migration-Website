import React, { Component } from 'react';
import Graph from './Graph.jsx';

export default class App extends Component {
    render() {
        return (
            <div>
                <h1>Twitch Migrations</h1>
                <p>This text should show up</p>
                <Graph />
            </div>
        );
    }
}
