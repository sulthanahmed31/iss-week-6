const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto"); // Mengimpor modul crypto untuk hashing

const server = http.createServer();
const io = socketIo(server);

const users = {}; // Menyimpan daftar pengguna
const messages = []; // Menyimpan riwayat pesan

// Fungsi untuk menghasilkan hash menggunakan SHA-3
function hashMessage(message) {
    return crypto.createHash('sha3-256').update(message).digest('hex'); // Menggunakan SHA-3
}

io.on("connection", (socket) => {
    console.log(`Client ${socket.id} connected`);

    // Mengirim riwayat pesan kepada klien baru
    socket.emit("history", messages);

   // Menangani pendaftaran pengguna
socket.on("register", (username) => {
    users[socket.id] = username;
    console.log(`${username} has joined the chat`);

    // Mengirim pesan broadcast kepada semua klien
    io.emit("message", { username: "Server", message: `${username} has joined the chat.` });
});

 // Menangani pesan yang diterima
socket.on("message", (data) => {
    let { username, message } = data;

    // Validasi pesan
    if (!username || !message) {
        console.log("Invalid message received");
        return;
    }

    // Hash pesan untuk tujuan penyimpanan
    const hashedMessage = hashMessage(message);
    const messageData = { username, message: hashedMessage }; // Simpan pesan yang di-hash
    messages.push(messageData); // Simpan pesan yang di-hash ke dalam array

    console.log(`Receiving message from ${username}: ${hashedMessage}`);
    
    // Kirim pesan asli ke semua klien, termasuk yang telah di-hash
    io.emit("message", { username, message }); // Kirim pesan asli ke klien
});


    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        const username = users[socket.id];
    
        if (username) {
            delete users[socket.id];
            io.emit("message", { username: "Server", message: `${username} has left the chat.` });
        }
    });
});
const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});