const React = require('react');
const constants = require('./constants');
const {Gallery} = require('./Gallery');


class PublicTimeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
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
                const media = item.media_attachments.map(a => {
                    const item_props = {
                        post_url: item.url
                    };

                    return Object.assign(item_props, a);
                });

                return acc.concat(media);
            }, []);

            return {
                last_id,
                items: old_state.items.concat(new_items),
                loading: false
            };
        });
    }

    loadMore() {
        if (this.state.loading)
            return;

        this.setState({loading: true});
        const {server} = this.props;

        let url = `${server}/api/v1/timelines/public`;
        url = `${url}?local=true&only_media=true&limit=${this.limit}`;

        if (this.state.last_id !== undefined)
            url = `${url}&max_id=${this.state.last_id}`

        fetch(url)
            .then(response => response.json())
            .then(items => this.appendItems(items));
    }


    render() {
        return <div>
            <Gallery
                items={this.state.items} load_more={() => this.loadMore()} />
        </div>;
    }
}

module.exports = {
    PublicTimeline,
}
