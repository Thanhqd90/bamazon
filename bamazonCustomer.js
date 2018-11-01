require('dotenv').config()
colors = require('colors');

const Table = require('cli-table'),
    keys = require("./keys.js"),
    inquirer = require("inquirer");

let mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: keys.user,
        password: keys.password,
        database: 'bamazon'
    })

connection.connect(function (err) {
    if (err) throw err;
    welcomeDisplay();
    listProducts();
});

function welcomeDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("                      Welcome to Bamazon                           ".bgRed);
    console.log("*******************************************************************\n".rainbow);
}

function listProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let table = new Table({
            head: ['ID'.underline.magenta, 'Name'.underline.yellow, 'Department'.underline.cyan, 'Price'.underline.green, 'Stock'.underline.red]
        })
        for (let i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price}`, res[i].stock_quantity]);
        };
        console.log("\n")
        console.log(table.toString());
    });
    placeOrder();
};

function placeOrder() {
    inquirer.prompt([{
            type: 'input',
            name: 'id',
            message: 'Enter the product ID of the item you want to purchase'.underline.yellow + ' (or '.grey + `${"q".bold.red}` + ' to exit)'.grey,
            validate: input => {
                if (input.toLowerCase() == 'q') process.exit()

                if (isNaN(input)) {
                    return 'Please enter a valid product number'.red
                }

                return true
            }
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Enter quantity of purchase'.underline.bold.magenta + ' (or '.grey + `${"q".bold.red}` + ' to exit)'.grey,
            validate: input => {
                if (input.toLowerCase() == 'q') process.exit()

                if (isNaN(input)) {
                    return 'Please valid number'.red
                }

                return true
            }
        }
    ]).then(function (order) {
        console.log('\033c');
        connection.query(
            "SELECT * FROM products WHERE ?", {
                item_id: order.id
            },
            function (err, res) {
                if (err) throw err;
                console.log("*******************************************************************".rainbow);
                console.log("                         Order Summary                             ".bgYellow.black);
                console.log("*******************************************************************".rainbow);
                let table = new Table({
                    head: ['Item Name'.underline.yellow, 'Quantity purchased'.underline.red, 'Total cost'.underline.green]
                })
                for (let i = 0; i < res.length; i++) {
                    if (res[i].stock_quantity > order.quantity) {
                        let total = order.quantity * res[i].price;
                        table.push([res[i].product_name, order.quantity, `$${total}`]);
                        console.log(table.toString());
                        connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [{
                                    stock_quantity: res[i].stock_quantity - order.quantity
                                },
                                {
                                    item_id: order.id
                                }
                            ],
                            function (err, res) {
                                if (err) throw err;

                                console.log("Purchase successful!!\n".bold.cyan);
                                welcomeDisplay();
                                listProducts();
                            }
                        )
                    } else {

                        console.log("Insufficient quantity please try again".bold.red);
                        console.log("Available stock: ".bold.blue + res[i].stock_quantity + "\n");
                        welcomeDisplay();
                        listProducts();
                    };
                };
            }
        )
    })
};