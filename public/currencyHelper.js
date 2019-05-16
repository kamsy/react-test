export const formatMoney = (
    amount,
    decimalCount = 2,
    decimal = ".",
    thousands = ","
) => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        const negativeSign = amount < 0 ? "-" : "";
        let i = parseInt(
            (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
        ).toString();
        let y = i.length > 3 ? i.length % 3 : 0;
        return (
            "$" +
            (negativeSign +
                (y ? i.substr(0, y) + thousands : "") +
                i.substr(y).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
                (decimalCount
                    ? decimal +
                      Math.abs(amount - i)
                          .toFixed(decimalCount)
                          .slice(2)
                    : ""))
        );
    } catch (e) {
        console.log("TCL: e", e);
    }
};
