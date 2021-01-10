const React = require('react');
const ReactDOM = require('react-dom');
const {TagViewer} = require('./TagViewer');
const {PublicTimeline} = require('./PublicTimeline');

const root = document.getElementById('root');
ReactDOM.render(<PublicTimeline server="https://mastodon.social" />, root);
