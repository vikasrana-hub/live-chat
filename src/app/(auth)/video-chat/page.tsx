"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../../../../socket/socket";

interface SignalData {
  from: string;
  signal: RTCSessionDescriptionInit | { candidate: RTCIceCandidateInit };
}

function VideoChat() {
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    socket.emit("join");

    socket.on("paired", (id: string) => {
      setPartnerId(id);
    });
socket.on("signal", async (data: SignalData) => {
  if (!peerRef.current) return;

  // Explicitly check if data.signal is an RTCSessionDescriptionInit
  if ("type" in data.signal) {
    const signal = data.signal as RTCSessionDescriptionInit; // Type-cast

    if (signal.type === "offer") {
      await peerRef.current.setRemoteDescription(signal);
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("signal", { to: data.from, signal: peerRef.current.localDescription });
      processQueuedIceCandidates();
    } else if (signal.type === "answer") {
      await peerRef.current.setRemoteDescription(signal);
      processQueuedIceCandidates();
    }
  } 
  // Handle ICE candidates separately
  else if ("candidate" in data.signal) {
    const candidateData = data.signal as { candidate: RTCIceCandidateInit }; // Type-cast

    if (peerRef.current.remoteDescription) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
    } else {
      iceCandidatesQueue.current.push(candidateData.candidate);
    }
  }
});




    return () => {
      socket.off("paired");
      socket.off("signal");
    };
  }, []);

  const processQueuedIceCandidates = async () => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error adding queued ICE candidate:", error);
      }
    }
  };

  const setupMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    peerRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
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
  }, [partnerId]);

  useEffect(() => {
    if (partnerId) {
      setupMedia();
    }
  }, [partnerId, setupMedia]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={localVideoRef} autoPlay muted className="w-1/2 border rounded-lg" />
      <video ref={remoteVideoRef} autoPlay className="w-1/2 border rounded-lg" />
      {!partnerId && <p>Waiting for a partner...</p>}
    </div>
  );
}

export default VideoChat;
