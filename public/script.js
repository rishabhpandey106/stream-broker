const userVideo = document.getElementById('user_video');
const sendStream = document.getElementById('stream-btn');

const state = {media: null};
const socket = io();

sendStream.addEventListener('click' , ()=>{
    const mediadata = new MediaRecorder(state.media , {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        framerate: 25
    });

    mediadata.ondataavailable = ev => {
        console.log('binary video data - ' , ev.data);
        socket.emit("binaryData",ev.data);
    }

    mediadata.start(25);
})

window.addEventListener('load', async e => {
    const mediaStreamConstraints = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(mediaStream => {
            state.media = mediaStream;
            userVideo.srcObject = mediaStream;
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
})