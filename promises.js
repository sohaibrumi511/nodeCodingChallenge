// Using promises

const url = require("url");
const http = require("http");
const https = require("https");

function fetchTitle(address, redirects = 3) {
  return new Promise((resolve) => {
    const protocol = address.startsWith("https") ? https : http;

    protocol
      .get(address, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirects > 0) {
            return fetchTitle(res.headers.location, redirects - 1).then(resolve);
          } else {
            return resolve({ address, title: "NO RESPONSE" });
          }
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const match = data.match(/<title>(.*?)<\/title>/);
          const title = match ? match[1] : "NO RESPONSE";
          resolve({ address, title });
        });
      })
      .on("error", () => {
        resolve({ address, title: "NO RESPONSE" });
      });
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === "/I/want/title/") {
    const addresses = [].concat(parsedUrl.query.address);
    
    const promises = addresses.map((address) => {
      if (!address.startsWith("http")) {
        address = `https://${address}`;
      }
      return fetchTitle(address);
    });

    Promise.all(promises).then((results) => {
      const titles = results
        .map((result) => `<li>${result.address} - "${result.title}"</li>`)
        .join("");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<html><body><h1>Following are the titles of given websites:</h1><ul>${titles}</ul></body></html>`
      );
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
