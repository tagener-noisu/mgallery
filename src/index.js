const React = require('react');
const ReactDOM = require('react-dom');
const {TagViewer} = require('./TagViewer');

const root = document.getElementById('root');
ReactDOM.render(<TagViewer server="https://mastodon.social" tag="pets" />, root);
