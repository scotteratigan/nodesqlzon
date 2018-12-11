const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hunter2!",
    database: "bamazon"
});
let productArray = [];

displayProducts();

function connectToDB() {
    connection.connect(function(err) {
        if (err) throw err;
		console.log("connected as id " + connection.threadId);
    });
}

function disconnectDB() {
	connection.end();
	console.log('Discoed');
}

function displayProducts() {
	connectToDB();
	console.log('*** Welcome to NodeSQLzon! ***');
    connection.query('SELECT * FROM products', function(err, res, fields) {  
        if (err) throw err;
		else if (res.length > 0) {
			res.forEach((product) => productArray.push(product) );
			console.log('got products...');
			var productTable = new Table;
			productArray.forEach( (product) => {
				productTable.cell('Id', product.id, Table.number(0));
				productTable.cell('Description', product.product_name);
				productTable.cell('Price, $', product.price, Table.number(2));
				productTable.newRow();
			});
			console.log(productTable.toString());
			promptToBuyProduct();
		}
        else console.log('Sold out of all items! Please come back soon.');
	});
	//
}

function promptToBuyProduct() {
	let idToPurchase, itemToPurchase, maxQuantity, price, quantity;
	inquirer.prompt([{
		name: 'id',
		type: 'input',
		message: 'Which product would you like to buy?',
		validate: (itemId) => {
			return (!isNaN(itemId) && itemId > 0 && itemId <= productArray.length); // todo: ensure number is in range.
		}
	}]).then( (purchase) => {
		idToPurchase = purchase.id;
		itemToPurchase = productArray[purchase.id - 1].product_name;
		maxQuantity = parseInt(productArray[purchase.id - 1].stock_quantity);
		price = parseFloat(productArray[purchase.id - 1].price).toFixed(2);
		inquirer.prompt([{
			name: 'quantity',
			type: 'input',
			message: 'How many would you like to buy',
			validate: (quantity) => {
				return (!isNaN(quantity) && quantity > 0 && quantity <= maxQuantity); // todo: ensure number is in range.
			}
		}]).then( (purchase) => {
			const salesTotal = parseInt(purchase.quantity) * price;
			quantity = purchase.quantity;
			console.log(`Ok, purchasing ${quantity} of ${itemToPurchase} for $ ${salesTotal}.`);
			purchaseItem(idToPurchase, quantity);
		});
	});
}

function buyProductFromDB() {
	connection.query(query, function(err, res, fields) {  
        if (err) throw err;
		else if (res.length > 0) {
		}
        else console.log('No response.');
	});
}

function purchaseItem(productId, purchaseQuantity) {
	let query = connection.query(
		"UPDATE products SET ? WHERE ?",
		[{ stock_quantity: purchaseQuantity }, { id: productId }],
		function(err, res) {
			console.log(res.affectedRows + " products updated!\n");
		});
	console.log(query.sql);
	disconnectDB();
}