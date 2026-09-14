const path = require("path");

// using existing data
const orders = require(path.resolve("src/data/orders-data"));

// using that functcion because its necessary
const nextId = require("../utils/nextId");

// middlewarior orders ids
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({ status: 404, message: `Order does not exist: ${orderId}.` });
}

// marioware input stuffs
function validateOrderFields(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    if (!deliverTo || deliverTo.trim() === "") {
        return next({ status: 400, message: "Order must include a deliverTo" });
    }
    if (!mobileNumber || mobileNumber.trim() === "") {
        return next({ status: 400, message: "Order must include a mobileNumber" });
    }
    if (!dishes) {
        return next({ status: 400, message: "Order must include a dish" });
    }
    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({ status: 400, message: "Order must include at least one dish" });
    }

    for (let idx = 0; idx < dishes.length; idx++) {
        const dish = dishes[idx];
        const quantity = dish.quantity;
        if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
            return next({
                status: 400,
                message: `Dish ${idx} must have a quantity that is an integer greater than 0`,
            });
        }
    }

    next();
}

// Middleware: Check ID parameters alignment
function validateOrderIdMatch(req, res, next) {
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;

    if (id && id !== orderId) {
        return next({
            status: 400,
            message: `Order id does not match route id. Data: ${id}, Route: ${orderId}`,
        });
    }
    next();
}

//MY MIDDLEWARE!!!!
function validateOrderStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];

    if (!status || status.trim() === "" || !validStatuses.includes(status)) {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
    }
    if (res.locals.order.status === "delivered") {
        return next({ status: 400, message: "A delivered order cannot be changed" });
    }
    next();
}

//the weirdo handlers
function list(req, res) {
    res.json({ data: orders });
}

function read(req, res) {
    res.json({ data: res.locals.order });
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status: status || "pending",
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}

function destroy(req, res, next) {
    const order = res.locals.order;
    if (order.status !== "pending") {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending",
        });
    }
    const index = orders.findIndex((o) => o.id === order.id);
    if (index > -1) {
        orders.splice(index, 1);
    }
    res.sendStatus(204);
}

module.exports = {
    list,
    read: [orderExists, read],
    create: [validateOrderFields, create],
    update: [orderExists, validateOrderFields, validateOrderIdMatch, validateOrderStatus, update],
    delete: [orderExists, destroy],
};

