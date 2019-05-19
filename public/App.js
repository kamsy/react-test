const { Component, Fragment } = React;

const e = React.createElement;

// simple loader
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

// function to format the amounts properly i.e $3.21
const formatMoney = (amount, decimalCount = 2, decimal = ".") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        // to convert the price to a string
        let i = amount.toString();

        // to get the whole number part of the currency === dollar, this depends on the length of the string
        let y = i.length > 2 ? i.length % 2 : 0;
        return (
            "$" +
            ((y ? i.substring(0, y) : 0) +
                (decimalCount ? decimal + i.substring(y) : ""))
        );
    } catch (e) {}
};
var randomNum;
var prevNum;
var index;

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

            // Fails early if there is  an error, it's already loading, there's nothing left to load
            if (error || loading || !hasMore) return;

            // Checks that the page has scrolled close to the bottom and dispatches fetch action
            const { offsetHeight, scrollTop } = document.documentElement;
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
        const { currentPage } = this.state;

        this.setState({ loading: true }, () => {
            fetch(`/api/products?_sort=${param}&_page=${currentPage}&_limit=20`)
                .then(res => res.json())
                .then(result => {
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

    // to increment the counter for the next page
    incrementPage = () => {
        this.setState(prevState => {
            return { ...prevState, currentPage: prevState.currentPage + 1 };
        });
    };
    // a method to display the sorter dropdown
    openSorters = () => {
        this.setState(prevState => {
            return { ...prevState, dropDown: !prevState.dropDown };
        });
    };

    // handling selection of what to sort by
    sortParamPicker = value => {
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

    // clear selected sort parameter
    clearSort = () => {
        const { sortParam } = this.state;
        if (sortParam !== "") {
            this.sortParamPicker("");
        }
        return;
    };

    // to generate random numbers for the ads
    numGen = () => {
        // generates a random number
        randomNum = Math.floor(Math.random() * 1000);
        // checking if the random number aren't prev number are even/odd to return the randomNum
        if (randomNum % 2 !== prevNum % 2 && prevNum !== undefined) {
            prevNum = randomNum;
            return randomNum;
        }
        // checking if random number and the previous number are even/odd and then increments the randonNum, to ensure the both a different number and number type aren't the same
        else if (randomNum % 2 === prevNum % 2) {
            randomNum++;
            return randomNum;
        }
        // returns the randomNum if the prevNum is 'undefinded'
        else {
            prevNum = randomNum;
            return randomNum;
        }
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

        const dd = new Date().getDate();
        const mm = new Date().getMonth();
        const yy = new Date().getFullYear();
        return (
            <Fragment>
                <div className="sorter-controllers">
                    <span
                        onClick={!loading ? this.openSorters : null}
                        className="cont-btn">
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

                {sortParam !== "" && data.length !== 0
                    ? `Sorted by ${sortParam}`
                    : null}
                <div className="grid-cont">
                    {data.map(datum => {
                        const { size, price, face, id, date } = datum;
                        /**  to convert the date to days in cardinal number... i.e 14,12,50 etc
                            so it can be used to show however long the products has been available
                        */
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
                                        {formatMoney(price)}
                                    </span>
                                    <span>{`${size} pixels`}</span>
                                    <span className="date">
                                        {`(${
                                            dateChecker === 0
                                                ? "Today"
                                                : dateChecker > 0 &&
                                                  dateChecker < 7
                                                ? `${dateChecker} days ago`
                                                : dateChecker === 7
                                                ? `a week ago`
                                                : `${dd}/${months[mm]}/${yy}`
                                        })`}
                                    </span>
                                </div>

                                {(data.findIndex(item => item.id === id) + 1) %
                                    20 ===
                                    0 &&
                                data.findIndex(item => item.id === id) !== 0 ? (
                                    <div
                                        className="grid-item"
                                        key={this.numGen().toString()}>
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
