require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASS,
    database: "bamazon"
});
let productArray = [];

displayProducts(); // displays products, prompts to buy product, disconnects. Essentially initiates everything.

async function connectToDB() {
	return new Promise( (resolve, reject) => {
		try {
			connection.connect();
			console.log(`*** Welcome to nodeSQLzon, you are customer number ${connection.threadId} ***`);
			return resolve();
		}
		catch(err) {
			console.error(err);
			return reject();
		}
	});
}

function disconnectDB() {
	connection.end();
	console.log('Thank you for shopping at nodeSQLzon! Have a great day.');
}

async function displayProducts() {
	await connectToDB();
    connection.query('SELECT * FROM products', (err, res, fields) => {  
        if (err) throw err;
		else if (res.length > 0) {
			res.forEach((product) => productArray.push(product) );
			let productTable = new Table;
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
}

function promptToBuyProduct() {
	inquirer.prompt([{
		name: 'id',
		type: 'input',
		message: 'Which product would you like to buy?',
		validate: (itemId) => {
			return (!isNaN(itemId) && itemId > 0 && itemId <= productArray.length);
		}
	}, {
		name: 'quantity',
		type: 'input',
		message: 'How many would you like to buy',
		validate: (quantity) => {
			return (!isNaN(quantity) && quantity > 0);
		}
	}]).then( async (purchaseItem) => {
		const product = productArray[purchaseItem.id - 1];
		const quantityToPurchase = parseInt(purchaseItem.quantity);
		const quantityInStock = parseInt(product.stock_quantity);
		const itemDescription = product.product_name;
		const priceEach = parseFloat(product.price).toFixed(2);
		const purchasePrice = (quantityToPurchase * priceEach).toFixed(2);
		if (quantityToPurchase > quantityInStock) {
			console.log(`Sorry, there are only ${quantityInStock} on hand, you cannot purchase ${quantityToPurchase}`);
			connection.end();
		}
		else {
			console.log(`Purchasing ${quantityToPurchase} of ${itemDescription} for ${purchasePrice}`);
			await buyProductFromDB(product, quantityToPurchase);
			console.log('Purchase completed.');
			disconnectDB();
		}
	});
}

function buyProductFromDB(product, quantityToPurchase) {
	return new Promise( (resolve, reject) => {
		try {
			connection.query("UPDATE products SET ?, ?, ? WHERE ?",
			[{
				stock_quantity: product.stock_quantity - quantityToPurchase
			}, {
				sold_quantity: product.sold_quantity + quantityToPurchase
			}, {
				sales_total: product.sales_total + (quantityToPurchase * product.price)
			}, {
				id: product.id
			}]);
			return resolve();
		}
		catch(err) {
			console.error(err);
			return reject();
		}
	});
}