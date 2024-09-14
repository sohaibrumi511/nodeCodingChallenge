// Using rxJS

const url = require("url");
const http = require("http");
const https = require("https");

function fetchTitle(address) {
  return new Promise((resolve, reject) => {
    const protocol = address.startsWith("https") ? https : http;

    protocol
      .get(address, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";

        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location.startsWith("http")
            ? res.headers.location
            : `${address.split("://")[0]}://${res.headers.location}`;
          return fetchTitle(redirectUrl).then(resolve).catch(reject);
        }

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
    Promise.all(
      addresses.map((address) => {
        if (!address.startsWith("http")) {
          address = `https://${address}`;
        }
        return fetchTitle(address);
      })
    )
      .then((results) => {
        const titles = results
          .map((result) => `<li>${result.address} - "${result.title}"</li>`)
          .join("");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          `<html><body><h1>Following are the titles of given websites:</h1><ul>${titles}</ul></body></html>`
        );
      })
      .catch(() => {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Internal Server Error</h1>");
      });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
