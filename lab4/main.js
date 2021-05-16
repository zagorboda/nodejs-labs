const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");
const util = require("util");
const qs = require('querystring');

const findmaxinteger = require("@zagorboda/findmaxinteger");
// npm/@zagorboda/findmaxinteger

// const app = http.createServer();
// const port = 8000;
//
// app.on("request", function(request, response) {
//     switch (request.method) {
//         case "GET": {
//             switch (url.parse(request.url).pathname) {
//                 case "/users":
//                     response.writeHead(200).end("GET users");
//                     break;
//                 case "/employees":
//                     response.writeHead(200).end("GET employees");
//                     break;
//                 default:
//                     // response.writeHead(200);
//                     // response.setHeader('Content-Type', 'application/json');
//                     // response.end(JSON.stringify({'a': 1}));
//                     fs.readFile(path.join(__dirname, "index.html"),
//                         function(error, data) {
//                             if (error) console.log(error);
//                             response.writeHead(200).end(data);
//                         });
//             }
//             break;
//         }
//         case "POST": {
//             switch (url.parse(request.url).pathname) {
//                 case "/users":
//                     request.on("data", function (data) {
//                         response.writeHead(200).end("You entered: " +
//                             data.toString().toUpperCase());
//                     });
//                     break;
//                 case "/employees":
//                     response.writeHead(200).end("POST employees");
//                     break;
//                 default:
//                     response.writeHead(200).end("POST. OK");
//             }
//             break;
//         }
//         case "PUT": {
//             response.writeHead(202).end("PUT");
//             break;
//         }
//         case "DELETE": {
//             response.writeHead(203).end("DELETE");break;
//         }
//         default: {
//             response.writeHead(404).end("Not found");
//         }
//     }
// });
// app.listen(port, function () {
//     console.log(`Listen port: ${port}`);
// });


const app = http.createServer();
const port = 8000;

const directory = './';

function getAllFiles(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            const map1 = new Map();
            map1.set(file, getAllFiles(dirPath + '/' + file, []))
            arrayOfFiles.push(map1);
        } else {
            arrayOfFiles.push(path.join(file));
        }
    })

    return arrayOfFiles
}

function js_to_html(files, depth) {
    depth = depth || 0;

    let res = '';
    let tab = '';
    for (let i=0; i < depth; ++i){
        tab += `______`;
    }
    for (const file of files){
        if (typeof file === 'string') {
            res += `<p><span>${tab}</span>${file}</p>`
        }
        else{
            for (let [key, value] of file.entries()) {
                res += `<p>${tab}${key}/</p>`;
                res += js_to_html(value, depth+1);
            }
        }
    }
    return res
}

app.on("request", function(request, response) {
    switch (request.method) {
        case "GET": {
            switch (url.parse(request.url).pathname) {
                case "/":
                    fs.readFile(path.join(__dirname, "index.html"),function(error, data) {
                        if (error)
                            console.log(error);
                        response.end(data);
                    });
                    break;
                case "/files":
                    let data = getAllFiles(directory, []);
                    data = js_to_html(data);

                    response.end(data);
                    break;
                case "/file":
                    fs.readFile(path.join(__dirname, "files.html"),function(error, data) {
                        if (error)
                            console.log(error);
                        response.end(data);
                    });
                    break;
            }
        }
        break;
        case "POST": {
            switch (url.parse(request.url).pathname) {
                case "/maxvalue":
                    let body = '';
                    request.on('data', function(chunck) {
                        body += chunck;
                    });

                    request.on('end', function() {
                        body = JSON.parse(body);
                        response.statusCode = 200;
                        const input_string = body.test;

                        let return_data;
                        try {
                            return_data = '' + findmaxinteger.findMaxInteger.findMaxInteger(input_string);
                        } catch (error){
                            return_data = JSON.stringify(error.stack.split("\n")[0])
                        }
                        response.end(return_data);
                    });


                    // let body = '';
                    // request.on('data', function (data) {
                    //     let json = qs.parse(data);
                    //     console.log(json);
                    //
                    //     console.log(data);
                    //     let some_val = data["test"];
                    //     console.log(some_val);
                    //     body += data;
                    //     console.log("Partial body: " + body);
                    //     console.log(typeof body);
                    // });
                    // request.on('end', function () {
                    //     console.log("Body: " + body);
                    //     console.log(body.test);
                    // });
                    // response.writeHead(200, {'Content-Type': 'text/html'});
                    // response.end('post received');

                    // let body = '';
                    // request.on('data', chunk => {
                    //     console.log(chunk);
                    //     body += chunk.toString(); // convert Buffer to string
                    // });
                    // request.on('end', () => {
                    //     console.log(body);
                    //     request.end('ok');
                    // });

                    // request.on("data", function (data) {
                    //     console.log(data);
                    //     console.log(JSON.stringify(data));
                    //     console.log(JSON.stringify(data)["input_value"]);
                    //     // console.log(typeof data);
                    //     // console.log(data.toString());
                    //     // const input_string = data.input_data;
                    //     // console.log(input_string);
                    //     // const max_value = findmaxinteger.findMaxInteger.findMaxInteger(input_string);
                    //     // response.end(max_value);
                    // });
                    // console.log(request.data);
                    // response.end('123');
                    break;
            }
        }
    }
});

app.listen(port, function () {
});