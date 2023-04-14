const createProxyMiddleware = require("http-proxy-middleware");

module.exports = function(app) {
    app.use(
        createProxyMiddleware("/scholarsportal", {
            target: "https://journals.scholarsportal.info", // API endpoint 1
            changeOrigin: true,
            pathRewrite: {
                "^/scholarsportal": "",
            },
            headers: {
                Connection: "keep-alive",
            },
        })
    );
    app.use(
        createProxyMiddleware("/serpapi", {
            target: "https://serpapi.com", // API endpoint 2
            changeOrigin: true,
            pathRewrite: {
                "^/serpapi": "",
            },
            headers: {
                Connection: "keep-alive",
            },
        })
    );
    app.use(
        createProxyMiddleware("/courtlistener", {
            target: "https://www.courtlistener.com", // API endpoint 3
            changeOrigin: true,
            pathRewrite: {
                "^/courtlistener": "",
            },
            headers: {
                Connection: "keep-alive",
            },
        })
    );
};
