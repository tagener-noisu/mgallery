const React = require('react');
const ReactDOM = require('react-dom');

const constants = {
    number_of_items_to_load: 20,
}

function GalleryItem(props) {
    const {preview_url} = props.contents;

    return <div className="gallery-item" onClick={props.onClick}>
        <img className="gallery-img" src={preview_url}></img>
    </div>;
}

function GalleryView(props) {
    if (!props.visible)
        return <div />;

    const {type, url, remote_url} = props.contents;
    const result_url = (remote_url === null ? url : remote_url);

    if (type === "image") {

        return <div id="gallery-view" onClick={props.closeView}>
            <img src={result_url}></img>
        </div>;
    } else {
        return <div id="gallery-view" onClick={props.closeView}>
            <video autoPlay loop src={result_url}></video>
        </div>;
    }
}

class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {index: undefined, view_visible: false};
    }

    previewClick(index) {
        this.setState({index, view_visible: true});
    }

    closeView() {
        this.setState({view_visible: false});
    }

    render() {
        const {index, view_visible} = this.state;

        return <div id="gallery">
            <GalleryView contents={this.props.items[index]} visible={view_visible} closeView={() => this.closeView()} />
            <div id="gallery-grid">{
                this.props.items.map((x, i) => {
                    return <GalleryItem key={x.id} contents={x} onClick={() => this.previewClick(i)} />;
                })
            }</div>
            <button onClick={this.props.load_more}>Load more</button>
        </div>;
    }
}

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
            if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 400)
                this.loadMore();
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

const root = document.getElementById('root');
ReactDOM.render(<TagViewer server="https://mastodon.social" tag="pets" />, root);
