const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const util = require('util');

const app = express();
const port = 8000;
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

app.use("/", express.static("public"));
app.use(bodyParser.json());


app.listen(port, () => {
    console.log(`Listen post: ${port}`);
});

app.use((request, response, next) => {
    fs.readFile(path.join(__dirname, "db.json"), (error, data) => {
        if (error)
            console.log(error);
        response.locals.db = JSON.parse(data.toString());
        next();
    });
});

function get_menu() {
    return readFile('menu.json');
}

function get_pizza_order_by_id(db, order_id){
    let status_code;
    let message;
    let object;

    if(typeof order_id == "undefined"){
        status_code = 400;
        message = "Invalid json. Should contain id key."
        object = null;
        return [status_code, object, message];
    }

    if (!order_id){
        status_code = 400;
        message = "Invalid data. ID must be positive integer."
        object = null;
        return [status_code, object, message];
    }

    order_id = +order_id;

    if (isNaN(order_id) || order_id < 0){
        status_code = 400;
        message = "Invalid data. ID must be positive integer."
        object = null;
        return [status_code, object, message];
    }

    object = db[order_id];
    if(typeof object == "undefined"){
        status_code = 404;
        message = `Order with id ${order_id} does not exist.`
        object = null;
        return [status_code, object, message];
    }

    status_code = 200;
    message = null;

    return [status_code, object, message];
}

function validate_new_order(order, menu){
    let status_code;
    let message;

    if(typeof order == "undefined"){
        status_code = 400;
        message = `Invalid json. Should contain 'order' key with string value of order.`;
        order = null;
        return [status_code, order, message];
    }

    order = order.replace(/ /g,'');
    order = order.split(',');

    let is_order_match_menu = order.every(function(val) {
        return menu.indexOf(val) >= 0;
    });

    if (!is_order_match_menu){
        status_code = 400;
        message = `Some pizza in order doesnt match with current menu`;
        order = null;
        return [status_code, order, message];
    }

    status_code = 200;
    message = null;
    return [status_code, order, message];
}

function write_to_file(data){
    return new Promise(function(resolve, reject) {
        fs.writeFile('db.json', JSON.stringify(data), function(err) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

app.route("/get_menu")
    .get(async (request, response) => {
        const menu = await get_menu();
        response.status(200).json(JSON.parse(menu.toString())["menu"]);
    })

app.route("/pizza")
    .get(async (request, response) => {
        response.send(response.locals.db);
    })
    .post(async (request, response) => {
        const body = request.body;

        let menu = await get_menu();
        menu = JSON.parse(menu.toString())["menu"]
        let [status_code, order, message] = validate_new_order(request.body.order, menu);

        response.status(status_code);
        if (!order){
            return response.send(message);
        }

        const db_ids = Object.keys(response.locals.db);
        let newId;
        if (db_ids.length === 0){
            newId = 1;
        } else{
            newId = +db_ids[db_ids.length-1] + 1;
        }

        response.locals.db[newId] = order;

        write_to_file(response.locals.db)
        .then((value) => {
            response.send(`Order (${order}) with id: ${newId} was created`);
        })
        .catch((error) => {
            console.log(error);
            response.send(message);
        });

    });



app.route("/pizza/:id")
    .get(async (request, response) => {
        let [status_code, object, message] = get_pizza_order_by_id(response.locals.db, request.params.id);

        response.status(status_code);
        if (object){
            response.send(object.toString());
        } else {
            response.send(message);
        }

    })
    .delete(async (request, response) => {
        const body = request.body;

        let order_id = request.params.id;
        let [status_code, order, message] = get_pizza_order_by_id(response.locals.db, order_id);

        response.status(status_code);
        if (!order){
            return response.send(message);
        }

        delete response.locals.db[order_id];

        write_to_file(response.locals.db)
            .then((value) => {
                response.send(`Order (${order}) with id: ${newId} was created`);
            })
            .catch((error) => {
                console.log(error);
                response.send(message);
            });

    })
    .patch(async (request, response) => {
        const body = request.body;

        let new_status_code, new_message;
        let order_id = request.params.id;
        let new_order = body.new_order;

        let menu = await get_menu();
        menu = JSON.parse(menu.toString())["menu"];

        [new_status_code, new_order, new_message] = validate_new_order(new_order, menu);
        if (!new_order){
            response.status(new_status_code);
            return response.send(message);
        }

        let [status_code, order, message] = get_pizza_order_by_id(response.locals.db, order_id);
        if (!order){
            response.status(status_code);
            return response.send(message);
        }

        response.locals.db[order_id] = new_order;

        try{
            await write_to_file(response.locals.db);
            response.send(`Order (${order}) with id: ${order_id} was changed`);
        } catch (e) {
            console.log(e);
        }

    // .then((value) => {
    //         response.send(`Order (${order}) with id: ${order_id} was changed`);
    //     })
    //         .catch((error) => {
    //             console.log(error);
    //             response.send(message);
    //         });
    });
