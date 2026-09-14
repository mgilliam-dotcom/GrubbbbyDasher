const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}

function validateDishFields(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    if (!name || name.trim() === "") {
        return next({ status: 400, message: "Dish must include a name" });
    }
    if (!description || description.trim() === "") {
        return next({ status: 400, message: "Dish must include a description" });
    }
    if (price === undefined || price === null) {
        return next({ status: 400, message: "Dish must include a price" });
    }
    if (!Number.isInteger(price) || price <= 0) {
        return next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    }
    if (!image_url || image_url.trim() === "") {
        return next({ status: 400, message: "Dish must include a image_url" });
    }

    next();
}

function validateDishIdMatch(req, res, next) {
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;

    if (id && id !== dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Data: ${id}, Route: ${dishId}`,
        });
    }
    next();
}

function list(req, res) {
    res.json({ data: dishes });
}

function read(req, res) {
    res.json({ data: res.locals.dish });
}

function create(req, res) {
    const { data: { name, description, price, image_url } } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } } = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
}

module.exports = {
    list,
    read: [dishExists, read],
    create: [validateDishFields, create],
    update: [dishExists, validateDishFields, validateDishIdMatch, update],
};
