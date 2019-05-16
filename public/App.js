const e = React.createElement;

const LoadingPage = ({ text }) => {
    return ( <
        div className = "loading-container" >
        <
        div className = "spinner" >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        div / >
        <
        /div> <
        p > { text } < /p> <
        /div>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            currentPage: 1,
            error: "",
            hasMore: true
        };

        // the scroll function to fetch data...
        window.onscroll = () => {
            const {
                fetchProducts,
                incrementPage,
                state: { error, loading, hasMore, currentPage }
            } = this;

            // Bails early if:
            // * there's an error
            // * it's already loading
            // * there's nothing left to load
            if (error || loading || !hasMore) return;

            // Checks that the page has scrolled close to the bottom
            const { offsetHeight, scrollTop } = document.documentElement;
            console.log(window.innerHeight, "innerHeight");
            console.log(offsetHeight, "offsetHeight");
            console.log(scrollTop, "scrollTop");
            if (offsetHeight - window.innerHeight === scrollTop) {
                incrementPage();
                fetchProducts();
            }
        };
    }

    componentDidMount() {
        this.fetchProducts();
    }

    componentDidUpdate() {
        console.log(
            "TCL: App -> componentDidUpdate -> this.state.currentPage",
            this.state.currentPage
        );
        console.log("TCL: App -> componentDidUpdate -> this.state", this.state);
    }

    fetchProducts = () => {
        const { currentPage } = this.state;
        console.log("TCL: App -> fetchProducts -> currentPage", currentPage);
        this.setState({ loading: true }, () => {
            fetch(`/api/products?_page=${currentPage}&_limit=60`)
                .then(res => res.json())
                .then(result => {
                    console.log(
                        "TCL: App -> componentDidMount -> result",
                        result
                    );
                    return this.setState(prevState => {
                        return {
                            data: [...prevState.data, ...result],
                            loading: false
                        };
                    });
                })
                .catch(err => {
                    this.setState({
                        error: err.message,
                        loading: false
                    });
                });
        });
    };

    incrementPage = () => {
        this.setState(prevState => {
            return {...prevState, currentPage: prevState.currentPage + 1 };
        });
    };

    render() {
        const { loading, data } = this.state;
        console.log("TCL: App -> render -> loaded", loading);
        if (!loading) {
            return ( <
                div className = "grid-cont" > {
                    data.map(datum => {
                        const { size, price, face, id } = datum;
                        return ( <
                            div className = "grid-item"
                            key = { id } >
                            <
                            span > Size: { size } < /span> <
                            span > Price: { price } < /span> <
                            span > Face: { face } < /span> <
                            /div>
                        );
                    })
                } <
                /div>
            );
        } else {
            return <LoadingPage text = "loading..." / > ;
        }
    }
}

const domContainer = document.querySelector(".products");
ReactDOM.render(e(App), domContainer);