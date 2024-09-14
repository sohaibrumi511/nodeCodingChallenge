// Using plain node.js callbacks

const url = require("url");
const http = require("http");
const https = require("https");

function fetchTitle(address, callback) {
  const protocol = address.startsWith("https") ? https : http;

  const req = protocol.get(
    address,
    { headers: { "User-Agent": "Mozilla/5.0" } },
    (res) => {
      let data = "";

      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchTitle(res.headers.location, callback);
        return;
      }

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const match = data.match(/<title>(.*?)<\/title>/);
        const title = match ? match[1] : "NO RESPONSE";
        callback(null, { address, title });
      });
    }
  );

  req.on("error", () => {
    callback(null, { address, title: "NO RESPONSE" });
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === "/I/want/title/") {
    const addresses = [].concat(parsedUrl.query.address);
    if (!addresses.length) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Address is required</h1>");
      return;
    }

    let titles = new Array(addresses.length);
    let completed = 0;

    addresses.forEach((address, index) => {
      address = address.trim();
      if (!address.startsWith("http")) {
        address = `https://${address}`;
      }
      address = encodeURI(address);

      fetchTitle(address, (err, result) => {
        titles[index] = `<li>${result.address} - "${result.title}"</li>`;
        completed++;

        if (completed === addresses.length) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            `<html><body><h1>Following are the titles of given websites:</h1><ul>${titles.join(
              ""
            )}</ul></body></html>`
          );
        }
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
