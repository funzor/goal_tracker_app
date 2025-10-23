//require node.js
const express = require('express');
const app = express()
const PORT = 3000;

app.get(/api/main, (req, res) =>  {

}


app.listen(PORT, () => {
	console.log(console.log(`server is running at http://localhost:${PORT}`));
});

