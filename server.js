import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import { Server } from "socket.io";

const port = process.env.PORT || 3000;

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

 const httpServer = http.createServer((request, response)=>{
    staticFile(request, response);
 });
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  console.log('connection client: ',socket.id);
  socket.on('disconnect', () => {
    console.log('disconnect user: ', socket.id);
  });
  socket.on('login', (msg) => {
    console.log(`login: ${msg.login} password: ${msg.password}`);
  });
});


httpServer.listen(port, '127.0.0.1', () => {
         console.log(`server listen on: ${port}`);
     });


    // const server = http.createServer((request, response)=>{
    //     staticFile(request,response);
    // }).listen(port, '127.0.0.1', () => {
    //     console.log(`server listen on: ${port}`);
    // });

    // const io = new Server(server);
    // console.log('dziala')
    // io.on("connection", (socket) => {
    // console.log('dodano' , socket.id);
    // })


    // //funkcje
    function staticFile(request, response){
        if(request.url === '/'){
            fs.readFile(`${__dirname}/public/index.html`,(error, file) =>{
                if(error){
                    response.writeHead(404, {'Content-Type' : 'text/plain; charset=utf-8'});
                    response.end('Błąd, nie udało się pobrać pliku');
                }else{
                    response.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'});
                    response.write(file);
                    response.end();
                }
            });
        }else  if(request.url === '/favicon.ico'){
            response.writeHead(200, {'Content-Type' : 'image/x-icon'})
            response.end();
            return
        }else{
            fs.readFile(`${__dirname}/public${request.url}`,(error, file) =>{
                if(error){
                    response.writeHead(404, {'Content-Type' : 'text/plain; charset=utf-8'});
                    response.end('Błąd, nie udało się pobrać pliku');
                }else{
                    switch(request.url.split('.')[1]){
                        case('png' || 'jpg' || 'jpeg'):
                            response.writeHead(200, {'Content-Type' : `image/${request.url.split('.')[1]}`});
                        break;
                        case('json') :
                            response.writeHead(200, {'Content-Type' : `application/json; charset=utf-8`});
                        break;
                        case('js') :
                        response.writeHead(200, {'Content-Type' : `application/javaScript; charset=utf-8`});
                    break;
                        case('css') :
                            response.writeHead(200, {'Content-Type' : `text/css; charset=utf-8`});
                    }
                    response.write(file);
                    response.end();
                }
            })
        }

    }