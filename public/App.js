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
var randomNum;
var prevNum;

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
            fetch(`/api/products?_sort=${param}&_page=${currentPage}&_limit=18`)
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

    numGen = () => {
        if (prevNum === randomNum) {
            randomNum = Math.floor(Math.random() * 1000);
        }
        console.log("TCL: numGen -> randomNum", randomNum);
        console.log("TCL: numGen -> prevNum", prevNum);
        prevNum = randomNum;

        return randomNum;
    };

    render() {
        const { loading, data, hasMore, dropDown, sortParam } = this.state;
        const months = [
            "Jan",
            "Feb",
            "March",
            "April",
            "May",
            "June",
            "July",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];
        const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sund"];
        const day = new Date().getDay();
        const dd = new Date().getDate();
        const mm = new Date().getMonth();
        const yy = new Date().getFullYear();
        return (
            <Fragment>
                <div className="sorter-controllers">
                    <span onClick={this.openSorters} className="cont-btn">
                        Sort
                    </span>
                    <span
                        onClick={() => this.clearSort("")}
                        className="cont-btn">
                        Clear sorter
                    </span>
                    <div
                        className="dropdown"
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
                        <span onClick={() => this.sortParamPicker("id")}>
                            ID
                        </span>
                    </div>
                </div>

                {sortParam !== "" ? `Sorted by ${sortParam}` : null}
                <div className="grid-cont">
                    {data.map(datum => {
                        const { size, price, face, id, date } = datum;
                        const dateChecker = Math.floor(
                            (new Date() - new Date(date)) /
                                (1000 * 60 * 60 * 24)
                        );

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
                                    <span>
                                        {dateChecker === 0
                                            ? "Today"
                                            : dateChecker > 0 && dateChecker < 7
                                            ? `${dateChecker} days ago`
                                            : dateChecker === 7
                                            ? `a week ago`
                                            : `${days[day]}, ${
                                                  months[mm]
                                              } ${dd}, ${yy}`}
                                    </span>
                                </div>

                                {(data.findIndex(item => item.id === id) + 1) %
                                    20 ===
                                    0 &&
                                data.findIndex(item => item.id === id) !== 0 ? (
                                    <div
                                        className="grid-item"
                                        key={this.numGen()}>
                                        <img
                                            className="ad"
                                            src={`/ads/?r=${this.numGen()}`}
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
