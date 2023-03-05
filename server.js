import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import mongoose from "mongoose";
import User from "./db/models/user.js";
import { url } from "inspector";

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = "mongodb://127.0.0.1:27017/dohdb";

const httpServer = http.createServer((request, response) => {
	staticFile(request, response);
});
const io = new Server(httpServer, {
	// ...
});

io.on("connection", socket => {
	console.log("connection client: ", socket.id);
	socket.on("disconnect", () => {
		console.log("disconnect user: ", socket.id);
	});
	socket.on("login", data => {
		console.log(`LOGOWANIE :: login: ${data.login} password: ${data.password}`);
		mongoose.connect(dbUrl).catch(e => {
			console.log(e);
			// jeżeli nie połączy się z bazą danych to trzeba odesłać do clienta info ala "Usługa chwilowo nie dostępna"
		});
		//zwraca true jeżeli dane do logowania się zgadzają
		loginUser(data).then(response => {
			if (response == true) {
				// TODO wysłać informację o poprawnym zalogowaniu
			} else {
				// TODO wysłać informacje o błędnym loginie bądź haśle
			}
		});
	});
	socket.on("register", data => {
		console.log(
			`REJESTRACJA :: login: ${data.login} password: ${data.password} email: ${data.email}, accepted regulations: ${data.regulations}`
		);
		mongoose.connect(dbUrl).catch(e => {
			console.log(e);
			// jeżeli nie połączy się z bazą danych to trzeba odesłać do clienta info ala "Usługa chwilowo nie dostępna"
		});
		createUser(data).then(response => {
			if (response == true) {
				// TODO wysłać informację do clienta o udanej rejestracji konta
				console.log(response);
			} else if (response == data.login) {
				// TODO wysłać informację do clienta, że login już istnieje
			} else if (response == data.email) {
				// TODO wysłać informację do clienta, że email już istnieje
			}
		});
	});
});

httpServer.listen(port, "127.0.0.1", () => {
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
function staticFile(request, response) {
	if (request.url === "/") {
		fs.readFile(`${__dirname}/public/index.html`, (error, file) => {
			if (error) {
				response.writeHead(404, {
					"Content-Type": "text/plain; charset=utf-8",
				});
				response.end("Błąd, nie udało się pobrać pliku");
			} else {
				response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				response.write(file);
				response.end();
			}
		});
	} else if (request.url === "/favicon.ico") {
		response.writeHead(200, { "Content-Type": "image/x-icon" });
		response.end();
		return;
	} else {
		fs.readFile(`${__dirname}/public${request.url}`, (error, file) => {
			if (error) {
				response.writeHead(404, {
					"Content-Type": "text/plain; charset=utf-8",
				});
				response.end("Błąd, nie udało się pobrać pliku");
			} else {
				switch (request.url.split(".")[1]) {
					case "png" || "jpg" || "jpeg":
						response.writeHead(200, {
							"Content-Type": `image/${request.url.split(".")[1]}`,
						});
						break;
					case "json":
						response.writeHead(200, {
							"Content-Type": `application/json; charset=utf-8`,
						});
						break;
					case "js":
						response.writeHead(200, {
							"Content-Type": `application/javaScript; charset=utf-8`,
						});
						break;
					case "css":
						response.writeHead(200, {
							"Content-Type": `text/css; charset=utf-8`,
						});
				}
				response.write(file);
				response.end();
			}
		});
	}
}

/// DATABASE FUNCTION
async function createUser(data) {
	const userLogin = await User.exists({ login: data.login });
	const userEmail = await User.exists({ email: data.email });
	try {
		if (userLogin == null && userEmail == null) {
			await User.create({
				login: data.login,
				password: data.password,
				email: data.email,
				regulations: data.regulations,
			});
			return true;
		} else if (userLogin != null) {
			return data.login;
		} else {
			return data.email;
		}
	} catch (e) {
		console.log(e);
	}
}

async function loginUser(data) {
	const user = await User.findOne({ login: data.login });
	if (
		user != null &&
		user.login == data.login &&
		user.password == data.password
	) {
		console.log(`User ${data.login} login`);
		return true;
	} else {
		return false;
	}
}
