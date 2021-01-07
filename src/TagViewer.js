const React = require('react');
const constants = require('./constants');
const {Gallery} = require('./Gallery');

class TagViewerInputs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            server: this.props.server,
            tag: this.props.tag,
        }
    }

    changeServer(server) {
        this.setState({server});
    }

    changeTag(tag) {
        this.setState({tag});
    }

    render() {
        const {server, tag} = this.state;

        return <div>
            <input value={server} onChange={e => this.changeServer(e.target.value)}></input>
            <input value={tag} onChange={e => this.changeTag(e.target.value)}></input>
            <button onClick={() => this.props.onChange(server, tag)}>Go</button>
        </div>;
    }
}
class TagViewer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            server: this.props.server,
            tag: this.props.tag,
            items: [],
            last_id: undefined,
            loading: false,
        };
        this.limit = constants.number_of_items_to_load;
    }

    appendItems(items) {
        if (items.length === 0)
            return;

        this.setState((old_state) => {
            const last_id = items[items.length - 1].id;

            const new_items = items.reduce((acc, item) => {
                return acc.concat(item.media_attachments);
            }, []);

            return {items: old_state.items.concat(new_items), last_id, loading: false};
        });
    }

    loadMore() {
        if (this.state.loading) return;

        this.setState({loading: true});

        const {server, tag} = this.state;
        let url =
            `${server}/api/v1/timelines/tag/${tag}?only_media=true&limit=${this.limit}`;

        if (this.state.last_id !== undefined)
            url = `${url}&max_id=${this.state.last_id}`

        fetch(url)
            .then(response => response.json())
            .then(items => this.appendItems(items));
    }

    componentDidMount() {
        this.loadMore();

        window.addEventListener("scroll", () => {
            if (window.innerHeight + window.pageYOffset >=
                document.body.offsetHeight - constants.preload_margin)
            {
                this.loadMore();
            }
        });
    }

    changeTagOrServer(new_server, new_tag) {
        this.setState(old_state => {
            if (old_state.server !== new_server || old_state.tag !== new_tag)
                return {items: [], last_id: undefined, server: new_server, tag: new_tag};
            else
                return {};
        }, this.loadMore);
    }

    render() {
        return <div>
            <TagViewerInputs
                onChange={(s, t) => this.changeTagOrServer(s, t)}
                server={this.props.server}
                tag={this.props.tag} />

            <Gallery
                items={this.state.items} load_more={() => this.loadMore()} />
        </div>;
    }
}

module.exports = {
    TagViewer,
}
