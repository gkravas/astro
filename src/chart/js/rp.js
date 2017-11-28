"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const uri = (options) => {
    let url = options.uri, qs = Object.keys(options.qs).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(options.qs[key].toString())}`;
    }).join("&");
    return `${url}?${qs}`;
};
const rp = (options) => {
    return new Promise((resolve, reject) => {
        const http = require("http");
        const lib = options.uri.startsWith("https") ? https : http;
        const url = uri(options);
        const req = lib.get(url, (response) => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error("HTTP Error: " + response.statusCode));
            }
            const body = [];
            response.on("data", (chunk) => body.push(chunk));
            response.on("end", () => resolve(JSON.parse(body.join(""))));
        });
        req.on("error", (err) => reject(err));
    });
};
exports.default = rp;
