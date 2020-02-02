let Peer = require('simple-peer');
let socket = io();

const video = document.querySelector('video');
let client = {};

// Get Stream. 
navigator.mediaDevices.getUserMedia ({audio: true})
    .then(stream => {
        socket.emit('NewClient')

        // Used to intialize a peer.
        function InitPeer() {
            let peer = new Peer({initiator:(type == 'init') ? true : false, stream: stream, trickle: false })
            peer.on('stream', function(stream) {
                CreateAudio(stream)
            })
            peer.on('close', function() {
                document.getElementById("peerAudio").remove();
                peer.destroy()
            })
            return peer;
        }

        // Make peer of type init. 
        function MakePeer() {
            client.gotAnswer = false;
            let peer = InitPeer('init');
            peer.on('signal', function(data) {
                if(!client.gotAnswer) {
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer;
        }

        // Peer of type not init
        function FrontAnswer(offer) {
            let peer = InitPeer('notInit')
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        // Set Answer.
        function SignalAnswer(answer) {
            client.gotAnswer = true;
            let peer = client.peer;
            peer.signal(answer);
        }

        // Create the audio stream needed for the other user. 
        function CreateAudio(stream) {
            let audio = document.createElement('audio');
            audio.id = 'peerAudio';
            audio.srcObject = stream;
            audio.class = 'embed-responsive-item';
            document.querySelector('#peerDiv').appendChild(audio);
            audio.play();
        }

        // Only peer to peer working now. 
        // This presents a message if multiple connections are attempted.
        function SessionActive() {
            document.write('Session Active. Please come back later');
        }

        socket.on('BackOffer', FrontAnswer);
        socket.on('BackAnswer', SignalAnswer);
        socket.on('SessionActive', SessionActive);
        socket.on('CreatePeer', MakePeer);

    })
    .catch(err => document.write(err))