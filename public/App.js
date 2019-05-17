const { Component, Fragment } = React;

const e = React.createElement;

const LoadingPage = () => {
    return (
        <div className="dot">
            Loading
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </div>
    );
};

const formatMoney = (amount, decimalCount = 2, decimal = ".") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        // to convert the asprice to a string
        let i = amount.toString();

        let y = i.length > 2 ? i.length % 2 : 0;
        return (
            "$" +
            ((y ? i.substring(0, y) : 0) +
                (decimalCount ? decimal + i.substring(y) : ""))
        );
    } catch (e) {
        console.log("TCL: e", e);
    }
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            currentPage: 1,
            error: "",
            hasMore: true,
            dropDown: false,
            sortParam: ""
        };

        // the scroll function to fetch data...
        window.onscroll = () => {
            const {
                fetchProducts,
                incrementPage,

                state: { error, loading, hasMore, sortParam }
            } = this;

            // Fails early if there is  an error, it's already loading,there's nothing left to load
            if (error || loading || !hasMore) return;

            // Checks that the page has scrolled close to the bottom
            const { offsetHeight, scrollTop } = document.documentElement;
            // console.log(window.innerHeight, "innerHeight");
            // console.log(offsetHeight, "offsetHeight");
            // console.log(scrollTop, "scrollTop");
            if (offsetHeight - window.innerHeight === scrollTop) {
                incrementPage();
                fetchProducts(sortParam);
            }
        };
    }

    componentDidMount() {
        this.fetchProducts();
    }

    fetchProducts = param => {
        console.log("TCL: App -> fetchProducts -> sortParam", param);
        const { currentPage } = this.state;

        console.log(
            "TCL: App -> `/api/products?_sort=${sortParam}&_page=${currentPage}&_limit=250`;",
            `/api/products?_sort=${param}&_page=${currentPage}&_limit=250`
        );
        this.setState({ loading: true }, () => {
            fetch(
                `/api/products?_sort=${param}&_page=${currentPage}&_limit=250`
            )
                .then(res => res.json())
                .then(result => {
                    console.log("TCL: App -> result", result);
                    return this.setState(prevState => {
                        return {
                            data: [...prevState.data, ...result],
                            loading: false,
                            hasMore: result.length > 0 ? true : false
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
            return { ...prevState, currentPage: prevState.currentPage + 1 };
        });
    };

    openSorters = () => {
        this.setState(prevState => {
            return { ...prevState, dropDown: !prevState.dropDown };
        });
    };

    sortParamPicker = value => {
        console.log("TCL: sortParam", value);

        this.setState(
            prevState => {
                return {
                    ...prevState,
                    data: [],
                    sortParam: value,
                    currentPage: 1,
                    hasMore: true,
                    error: ""
                };
            },
            () => this.fetchProducts(value)
        );
        this.openSorters();
    };

    clearSort = () => {
        const { sortParam } = this.state;
        if (sortParam !== "") {
            this.sortParamPicker("");
        }
        return;
    };

    render() {
        const { loading, data, hasMore, dropDown, sortParam } = this.state;
        console.log("TCL: render -> hasMore", hasMore);

        return (
            <Fragment>
                <span onClick={this.openSorters}>Sort</span>
                <span onClick={() => this.clearSort("")}>Clear sorter</span>
                {sortParam !== "" ? `Sorted by ${sortParam}` : null}
                <div
                    style={{
                        display: dropDown ? "flex" : "none",
                        flexDirection: "column"
                    }}>
                    <span onClick={() => this.sortParamPicker("price")}>
                        Price
                    </span>
                    <span onClick={() => this.sortParamPicker("size")}>
                        Size
                    </span>
                    <span onClick={() => this.sortParamPicker("id")}>ID</span>
                </div>
                <div className="grid-cont">
                    {data.map(datum => {
                        const { size, price, face, id } = datum;
                        return (
                            <Fragment>
                                <div className="grid-item" key={id}>
                                    <span
                                        style={{ fontSize: `${size}px` }}
                                        className="face">
                                        {face}
                                    </span>
                                    <hr />
                                    <span className="money">
                                        {formatMoney(price)}{" "}
                                    </span>
                                    <span> Size: {size} </span>
                                </div>
                                {console.log(
                                    (data.findIndex(item => item.id === id) +
                                        1) %
                                        20 ===
                                        0 &&
                                        data.findIndex(
                                            item => item.id === id
                                        ) !== 0,
                                    data.findIndex(item => item.id === id)
                                )}
                                {(data.findIndex(item => item.id === id) + 1) %
                                    20 ===
                                    0 &&
                                data.findIndex(item => item.id === id) !== 0 ? (
                                    <div className="grid-item">
                                        <img
                                            className="ad"
                                            src={`/ads/?r=${Math.floor(
                                                Math.random() * 1000
                                            )}
                        `}
                                        />
                                    </div>
                                ) : null}
                            </Fragment>
                        );
                    })}
                </div>
                {loading ? <LoadingPage /> : null}
                {hasMore ? null : "~ end of catalogue ~"}
            </Fragment>
        );
    }
}

const domContainer = document.querySelector(".products");
ReactDOM.render(e(App), domContainer);
