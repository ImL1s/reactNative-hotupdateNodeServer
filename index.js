let express = require('express');
let app = express();
let updateHandler = require('./src/handlers/UpdateHandler');

app.use(express.static('public'));

app.get('/version', (req, resp) => {
    updateHandler.handle(req,resp);
});

app.listen(5055);
