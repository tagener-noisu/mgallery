const React = require('react');
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
            const el = <GalleryItem
                key={x.id} contents={x} onClick={() => this.previewClick(i)} />;

            columns[column].push(el);

            return columns;
        }, empty_columns);

        const grid_style = {gridTemplateColumns:
            `repeat(${number_of_columns}, ${column_width}px)`};

        const grid = <div id="gallery-grid" style={grid_style}>{
            columns.map((c, i) =>
                <div key={i} className="gallery-column">{c}</div>
            )
        }</div>;

        const max_width = column_width * number_of_columns;
        return <div id="gallery" style={{maxWidth: `${max_width}px`}}>
            <GalleryView
                contents={this.props.items[index]}
                visible={view_visible}
                closeView={() => this.closeView()}
            />
            {grid}
            <button onClick={this.props.load_more}>Load more</button>
        </div>;
    }
}

module.exports = {
    Gallery
}
