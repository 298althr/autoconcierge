const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const secret = process.env.JWT_ACCESS_SECRET;
const user = {
    id: 'f618ddf3-12cf-431d-b24d-dcbb9f45a890',
    email: 'premium_imports@dealer.com'
};

const token = jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: '1h' }
);

console.log(token);
process.exit(0);
