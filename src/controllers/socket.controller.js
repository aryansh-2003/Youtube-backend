import {memo} from "../memo.js"

export const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("⚡ Connected:", socket.id);
    memo.push(socket.id)
    socket.on("message", (msg) => {
      console.log("📩 Message:", msg);

      // broadcast
      io.emit("notification", msg);
    });
 console.log(memo)
    socket.on("disconnect", () => {
      console.log("🔌 Disconnected:", socket.id);
       memo.pop(socket.id)
       console.log(memo)
    });

  });

};
