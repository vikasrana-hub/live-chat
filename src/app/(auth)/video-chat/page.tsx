"use client";
import { useEffect, useRef, useState } from 'react';
import socket from "../../../../socket/socket";

function VideoChat() {
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]); // Store the ICE candidate queue in useRef

    useEffect(() => {
        // Join the video chat
        socket.emit("join");

        socket.on("paired", (id: string) => {
            setPartnerId(id);
        });

        socket.on("signal", async (data: any) => {
            if (!peerRef.current) return;

            if (data.signal.type === "offer") {
                await peerRef.current.setRemoteDescription(data.signal);
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                socket.emit("signal", {
                    to: data.from,
                    signal: peerRef.current.localDescription,
                });
            } else if (data.signal.type === "answer") {
                await peerRef.current.setRemoteDescription(data.signal);
            } else if (data.signal.candidate) {
                // Store the candidate if remote description isn't set yet
                if (peerRef.current.remoteDescription) {
                    try {
                        const iceCandidate = new RTCIceCandidate(data.signal.candidate);
                        await peerRef.current.addIceCandidate(iceCandidate);
                    } catch (error) {
                        console.error("Error adding ICE candidate:", error);
                    }
                } else {
                    console.warn("Remote description not set, queuing ICE candidate.");
                    iceCandidatesQueue.current.push(data.signal.candidate); // Queue candidate for later
                }
            }
        });

        return () => {
            socket.off("paired");
            socket.off("signal");
        };
    }, []);

    const setupMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        peerRef.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        stream.getTracks().forEach((track) => {
            if (peerRef.current) peerRef.current.addTrack(track, stream);
        });

        peerRef.current.ontrack = (event) => {
            const [remotestream] = event.streams;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remotestream;
            }
        };

        peerRef.current.onicecandidate = (event) => {
            if (event.candidate && partnerId) {
                socket.emit("signal", { to: partnerId, signal: event.candidate });
            }
        };

        if (partnerId) {
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            socket.emit("signal", { to: partnerId, signal: offer });
        }
    };

    useEffect(() => {
        if (partnerId) {
            setupMedia();
        }
    }, [partnerId]);

    // Effect to process ICE candidates when remote description is set
    useEffect(() => {
        if (peerRef.current && peerRef.current.remoteDescription) {
            // Process queued candidates when remote description is set
            iceCandidatesQueue.current.forEach(async (candidate: RTCIceCandidate) => {
                try {
                    if (peerRef.current) {
                        await peerRef.current.addIceCandidate(candidate);
                    }
                } catch (error) {
                    console.error("Error adding queued ICE candidate:", error);
                }
            });
            iceCandidatesQueue.current.length = 0; // Clear the queue after processing
        }
    }, [peerRef.current?.remoteDescription]);

    return (
        <div className="flex flex-col items-center space-y-4">
            <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-1/2 border rounded-lg"
            />
            <video
                ref={remoteVideoRef}
                autoPlay
                className="w-1/2 border rounded-lg"
            />
            {!partnerId && <p>Waiting for a partner...</p>}
        </div>
    );
}

export default VideoChat;
