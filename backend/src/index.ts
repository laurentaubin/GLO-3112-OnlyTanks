const express = require("express");
const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", (_res: any, res: any) => {
  res.send("Hello world!");
});

// start the Express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});