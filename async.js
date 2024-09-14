// Using async.js

const url = require("url");
const http = require("http");
const https = require("https");
const async = require("async");

function fetchTitle(address, callback, redirects = 3) {
  const protocol = address.startsWith("https") ? https : http;

  protocol
    .get(address, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects > 0) {
          return fetchTitle(res.headers.location, callback, redirects - 1);
        } else {
          return callback(null, { address, title: "NO RESPONSE" });
        }
      }

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const match = data.match(/<title>(.*?)<\/title>/);
        const title = match ? match[1] : "NO RESPONSE";
        callback(null, { address, title });
      });
    })
    .on("error", () => {
      callback(null, { address, title: "NO RESPONSE" });
    });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === "/I/want/title/") {
    const addresses = [].concat(parsedUrl.query.address);
    async.map(
      addresses,
      (address, callback) => {
        if (!address.startsWith("http")) {
          address = `https://${address}`;
        }
        fetchTitle(address, callback);
      },
      (err, results) => {
        const titles = results
          .map((result) => `<li>${result.address} - "${result.title}"</li>`)
          .join("");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          `<html><body><h1>Following are the titles of given websites:</h1><ul>${titles}</ul></body></html>`
        );
      }
    );
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
