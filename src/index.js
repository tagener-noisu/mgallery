const React = require('react');
const ReactDOM = require('react-dom');
const constants = require('./constants');

function GalleryItem(props) {
    const {preview_url} = props.contents;

    return <div className="gallery-item" onClick={props.onClick}>
        <img className="gallery-img" src={preview_url}></img>
    </div>;
}

function GalleryViewObject(props) {
    if (props.type === "image")
        return <img src={props.url}></img>;
    else
        return <video autoPlay loop src={props.url}></video>;
}

function GalleryView(props) {
    if (!props.visible)
        return <div />;

    const {type, url} = props.contents;

    return <div id="gallery-view" onClick={props.closeView}>
        <GalleryViewObject type={type} url={url} />
    </div>;
}

class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {index: undefined, view_visible: false};
    }

    componentDidMount() {
        window.addEventListener("keydown", e => {
            this.handleKeyDown(e.key);
        });
    }

    handleKeyDown(key) {
        if (key === "ArrowRight")
            this.nextItem();
        else if (key === "ArrowLeft")
            this.previousItem();
    }

    previewClick(index) {
        this.setState({index, view_visible: true});
    }

    closeView() {
        this.setState({view_visible: false});
    }

    nextItem() {
        this.setState((old_state) => {
            const length = this.props.items.length;
            let index = old_state.index + 1;

            if (index >= length - 1)
                return {};
            else
                return {index};
        });
    }

    previousItem() {
        this.setState((old_state) => {
            const length = this.props.items.length;
            let index = old_state.index - 1;

            if (index < 0)
                return {};
            else
                return {index};
        });
    }

    render() {
        const {index, view_visible} = this.state;
        const {number_of_columns, column_width} = constants;

        const empty_columns = [];
        for (let i = 0; i < number_of_columns; ++i)
            empty_columns.push([]);

        const columns = this.props.items.reduce((columns, x, i) => {
            const column = i % number_of_columns;
            const el = <GalleryItem key={x.id} contents={x} onClick={() => this.previewClick(i)} />;
            columns[column].push(el);

            return columns;
        }, empty_columns);

        const grid_template_col = `repeat(${number_of_columns}, ${column_width}px)`;
        const grid = <div id="gallery-grid" style={{gridTemplateColumns: grid_template_col}}>{
            columns.map((c, i) => <div key={i} className="gallery-column">{c}</div>)
        }</div>;

        const max_width = column_width * number_of_columns;
        return <div id="gallery" style={{maxWidth: `${max_width}px`}}>
            <GalleryView contents={this.props.items[index]} visible={view_visible} closeView={() => this.closeView()} />
            {grid}
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

const root = document.getElementById('root');
ReactDOM.render(<TagViewer server="https://mastodon.social" tag="pets" />, root);
