const io = require("socket.io-client");
const readline = require("readline");
//menyambung ke server
const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        socket.emit("register", username); // Mendaftar dengan nama pengguna
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()) {
                socket.emit("message", { username, message }); // Kirim pesan tanpa hashing
            } else {
                console.log("Cannot send an empty message.");
            }
            rl.prompt();
        });
    });
});

// Menerima riwayat pesan dari server
socket.on("history", (history) => {
    console.log("Chat History:");
    history.forEach(({ username, message }) => {
        console.log(`${username}: ${message}`);
    });
});

// Menerima pesan dari server
socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage } = data;

    if (senderUsername !== username) {
        console.log(`${senderUsername}: ${senderMessage}`); // Mencetak pesan yang sudah di-hash
        rl.prompt();
    }
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});