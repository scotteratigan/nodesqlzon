# nodesqlzon
### 'Storefront' using node/sql.

### Technologies
- inquirer to display & select choices in console.
- dotenv to obscure db password
- mysql to connect to SQL database
- easy-table to format columns in console
- es6 await/async with promises
- error handling via try/catch or callback error functions

### Customer View

Customer Completes a Purchase (and DB is updated):
![Customer Completing a Purchase](images/customer_buying_product.gif "Customer Completes a Purchase")

Purchase Rejected - too many requested (no updates to DB):
![Customer Purchase Rejected](images/customer_purchase_rejected.gif "Customer Purchase Rejected")

### Getting Started

- Clone this repository
- npm install
- Create a database by running "initialize_database.sql" schema
- Create a .env file with DB_PASS=yourpassword
- node customer (to display customer storefront)
- node manager (to display manager functions)
