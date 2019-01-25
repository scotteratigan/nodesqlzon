const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');

const LOWSTOCKWARNING = 5;

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hunter2!",
    database: "bamazon"
});
let productArray = [];

console.clear();
connectToDB();
promptManagerFunction();

function connectToDB() {
	return new Promise( async (resolve, reject) => {
		try {
			await connection.connect();
			return resolve();
		}
		catch(err) {
			console.error(err);
			return reject();
		}
	});
}

async function promptManagerFunction() {
	//await connectToDB();
	let managerChoice = await inquirer.prompt([{
		name: 'action',
		type: 'list',
		message: 'What would you like to do?',
		choices: ['View Products for Sale', 'View Products by Department', 'View Products by Inventory (ascending)', 'View Products by Inventory (descending)', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Remove Product', 'Quit']
	}]);
	await performSelectedAction(managerChoice.action);
	promptManagerFunction(); // Calls itself recursively forever unless 'Quit' is selected in performSelectedAction
}

async function performSelectedAction(managerFunction) {
	switch (managerFunction) {
		case 'View Products for Sale':
			await displayProducts().catch((err) => console.error(err));
			break;
		case 'View Products by Department':
			await displayProducts('SELECT * FROM products ORDER BY department_name').catch((err) => console.error(err));
			break;
		case 'View Products by Inventory (ascending)':
			await displayProducts('SELECT * FROM products ORDER BY stock_quantity ASC').catch((err) => console.error(err));
			break;
		case 'View Products by Inventory (descending)':
			await displayProducts('SELECT * FROM products ORDER BY stock_quantity DESC').catch((err) => console.error(err));
			break;
		case 'View Low Inventory':
			await displayProducts(`SELECT * FROM products WHERE stock_quantity <= ${LOWSTOCKWARNING} ORDER BY stock_quantity ASC`).catch((err) => console.error(err));
			break;
		case 'Add to Inventory':
			await addToInventory().catch((err) => console.error('Error adding inventory...', err));
			break;
		case 'Add New Product':
			await addNewProduct().catch( (err) => console.error('Error adding new product.', err));
			break;
		case 'Remove Product':
			await removeProduct().catch( (err) => console.error('Error removing a product.', err));
			break;
		case 'Quit':
			connection.end();
			return console.log('Quitting...');
			process.exit(0);
			break;
		default:
			console.error(`Error, selection of ${managerFunction} is not valid.`);
			process.exit(1);
			break;
	};
	// promptManagerFunction();
}

async function addToInventory() {
	await displayProducts().catch((err) => console.error(err));
	let managerChoice = await inquirer.prompt([{
		name: 'itemId',
		type: 'choice',
		message: `Enter the ID number of the product you're adding inventory to`,
		validate: (itemId) => {
			return (!isNaN(itemId) && itemId > 0 && itemId <= productArray.length);
		}
	}, {
		name: 'quantity',
		type: 'choice',
		message: 'How many are you adding to inventory?',
		validate: (quantity) => {
			return (!isNaN(quantity) && quantity >= 0);
		}
	}]);
	await updateStockQuantity(managerChoice.itemId, parseInt(managerChoice.quantity));
	console.log(`Added ${managerChoice.quantity} to id ${managerChoice.itemId}.`);
}

async function updateStockQuantity(itemId, quantityToAdd) {
	return new Promise( (resolve, reject) => {
	const currentQuantity = productArray[itemId - 1].stock_quantity;
	const newQuantity = currentQuantity + quantityToAdd;
	connection.query(`UPDATE products SET ? where ?`, [{stock_quantity: newQuantity}, {id: itemId}], function(err, res, fields) {
			if (err) throw err;
			return resolve(res);
		});
	});
}

async function addNewProduct() {
	const newProduct = await inquirer.prompt([{
		name: 'product_name',
		type: 'choice',
		message: `What is the name of the product?`,
		validate: (productName) => {
			return (productName.length > 5);
		}
	}, {
		name: 'department_name',
		type: 'choice',
		message: 'Which department does the product belong in?',
		validate: (departmentName) => {
			return (departmentName == 'full stack' || departmentName == 'front end' || departmentName == 'back end');
		}
	}, {
		name: 'price',
		type: 'choice',
		message: 'How much does it cost?',
		validate: (price) => {
			return (!isNaN(price) && price > 0);
		}
	}, {
		name: 'stock_quantity',
		type: 'choice',
		message: 'How many are in stock?',
		validate: (stockQuantity) => {
			return (!isNaN(stockQuantity) && stockQuantity > 0);
		}
	}]);
	console.log('Adding new product:');
	console.log('Name:', newProduct.product_name);
	console.log('Dept:', newProduct.department_name);
	console.log('price:', newProduct.price);
	console.log('stock:', newProduct.stock_quantity);
	
	// syntax for the following was tricky...
	await connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity, sold_quantity, sales_total) VALUES (?, ?, ?, ?, ?, ?)', 
	[newProduct.product_name, newProduct.department_name, newProduct.price, newProduct.stock_quantity, 0, 0.00],
	function(err, res) {
		if (err) console.error(err);
	});
	await displayProducts();

}

async function displayProducts(queryString = 'SELECT * FROM products') {
	return new Promise(async (resolve, reject) => {
		let res = await getProductsFromDB(queryString).catch((err) => {console.error(err)});
		console.clear();
		productArray = []; // wipe out any old data;
		if (res) { // res will be null if we've deleted all products, or we're viewing low inventory but everything is well-stocked.
			res.forEach((product) => productArray.push(product) );
			var productTable = new Table;
			productArray.forEach( (product) => {
				productTable.cell('Id', product.id, Table.number(0));
				productTable.cell('Description', product.product_name);
				productTable.cell('Department', product.department_name);
				productTable.cell('Stock', product.stock_quantity, Table.number(0));
				productTable.newRow();
			});
			await console.log(productTable.toString());
		}
		else {
			console.log('No products meet the specified display criteria.\n\n');
		}
		
		return resolve();
	});
}

function getProductsFromDB(queryString) {
	return new Promise( (resolve, reject) => {
		connection.query(queryString, function(err, res, fields) {
			//connection.end();
			if (err) throw err;
			else if (res.length > 0) {
				return resolve(res);
			}
			else return reject([]);
		});
	});
}

async function removeProduct() {
	return new Promise ( async (resolve, reject) => {
		await displayProducts();
		let selection = await inquirer.prompt([{
			name: 'id',
			type: 'input',
			message: 'Which product would you like to remove?',
			validate: (itemId) => {
				return (!isNaN(itemId) && itemId > 0);
			}
		}]);
		await connection.query('DELETE FROM products WHERE id = ?', [selection.id]);
		console.log(`Product ${selection.id} removed.`);
		return resolve();
	}) // end of promise
}