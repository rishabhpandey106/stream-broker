import http from 'http'
import express from 'express'
import dotenv from 'dotenv';
dotenv.config();
import path from 'path'
import { Server as SocketIO } from 'socket.io';
import { spawn } from 'child_process';

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
app.use(express.static(path.resolve('./public')))
const io = new SocketIO(server);

const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${process.env.YOUTUBE_API}`,
];

const ffmpegProcess = spawn('ffmpeg',options);

ffmpegProcess.stdout.on('data',(data)=>{
    console.log('ffmpeg output data - ', data);
})

ffmpegProcess.stderr.on('data',(data)=>{
    console.error('ffmpeg output error - ', data);
})

ffmpegProcess.on('close',(code)=>{
    console.error('ffmpeg exited with code - ', code);
})

app.get("/", (req,res)=>{
    res.send("public/index.html")
})

io.on('connection',(socket)=>{
    console.log('socket connected - ', socket.id);

    socket.on("binaryData", (data)=>{
        console.log('binary data from client stream - ', data);
        ffmpegProcess.stdin.write(data,(error)=>{
            console.log('Error - ', error);
        })
    })
})

server.listen(port , ()=>{
    console.log(`server connected on port ${port}`);
})
