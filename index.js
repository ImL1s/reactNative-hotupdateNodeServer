import { LISTEN_PORT } from './src/Constants';

let express = require('express');
let app = express();
let updateHandler = require('./src/handlers/UpdateHandler');

app.use(express.static('public'));

app.get('/version', (req, resp) => {
    updateHandler.handleGetSource(req,resp).subscribe();
});

app.listen(LISTEN_PORT);
