INSTALL FOR BACKEND:
npm install
npm install express ( Used to create a server and handle routes (e.g., /login, /users).)
npm install sequelize (Used to interact with the database using JavaScript instead of raw SQL.)
npm install mysql2 (Used as the MySQL database driver so Sequelize (or raw queries) can connect to MySQL.)
npm install nodemailer (Used to send emails from your backend (e.g., password resets, verification codes).)
npm install cors (Used to allow your API to accept requests from other domains or ports.)
npm install dotenv (Used to load sensitive settings (like passwords, keys) from a .env file into your code.)
npm install bcryptjs (Used to hash passwords so they’re stored securely in the database.)
npm install jsonwebtoken (Used to create and check JWT tokens for authentication/authorization.)
npm install multer (Used to handle file uploads (like profile pictures) from forms.)
npm install nodemon --save-dev (Used to auto-restart your server when you change code (for development only).)