require('dotenv').config();

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRouter = require('./routes/api');
const connection = require('./config/database');
const { ensureProductIndexAndReindex } = require('./services/productService');
const {getHomePage} = require('./controllers/homeController');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomePage);
app.use("/", webAPI);

app.use("/v1/api/", apiRouter);
(async () => {
    try {
    await connection();
    // Ensure Elasticsearch index exists and seed data if empty (no-op if ES disabled)
    await ensureProductIndexAndReindex();
    app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
    }
})();