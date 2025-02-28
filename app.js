const http = require('http')

http.createServer(function (req, res) {
res.write("Full snack engineer!");
res.end();
}
).listen(3000);

console.log("Server started listening at port 3000");
