# Icon Coding Challenge

This project contains four different implementations of a simple Node.js server that fetches the title of websites from their URLs. The server listens for requests at `/I/want/title/` and responds with the titles of the websites passed as query parameters. The implementations utilize **plain Node.js callbacks**, **async.js**, **promises**, and **rxJS**.

## Project Structure

- **Plain Node.js Callbacks**: Uses traditional Node.js callback style for handling asynchronous title fetching.
- **Async.js Implementation**: Uses `async` for asynchronous control flow management to fetch titles from multiple URLs.
- **Promises Implementation**: Implements asynchronous fetching using JavaScript promises.
- **rxJS Implementation**: Uses `rxJS` to handle asynchronous title fetching using promises.

## Installation

1. Download and Unzip the file.
2. Navigate to the project directory:
   ```bash
   cd <your-project-directory>
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## Running the Server

To run the server, you can use any of the implementations provided. Each implementation is in a separate file, so you'll need to run the one you prefer.

### Steps to run the server:

1. **Run the Plain Callbacks server**:
   ```bash
   node plainNode.js
   ```

2. **Run the Async.js server**:
   ```bash
   node async.js
   ```
   

3. **Run the Promises server**:
   ```bash
   node promises.js
   ```

4. **Run the rxJS server**:
   ```bash
   node rx.js
   ```

The server will listen on port `3000` by default.

### Example Usage:

Once the server is running, you can fetch the titles of websites by navigating to:

```
http://localhost:3000/I/want/title/?address=google.com
```

You can pass multiple `address` query parameters, and the server will return the titles of the respective websites.

## Notes

- The server supports up to 3 redirects for fetching the title from a URL.
- If the title is not found or there’s an error, the response will show `"NO RESPONSE"`.
