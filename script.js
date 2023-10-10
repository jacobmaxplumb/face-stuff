const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    drawCheekboneCircles(canvas, resizedDetections);
  }, 100)
})

// Draw yellow circles over the detected cheekbones
function drawCheekboneCircles(canvas, detections) {
  const context = canvas.getContext('2d');
  context.strokeStyle = 'yellow';
  context.lineWidth = 2;

  if (detections && detections.length > 0) {
      const leftCheek = detections[0].landmarks._positions[0];
      const rightCheek = detections[0].landmarks._positions[16];
      const nose = detections[0].landmarks._positions[30];

      const halfwayLeft = {
        x: (leftCheek.x + nose.x) / 2,
        y: (leftCheek.y + nose.y) / 2
      };

      const halfwayRight = {
        x: (rightCheek.x + nose.x) / 2,
        y: (rightCheek.y + nose.y) / 2
      };

      // Draw circles at the cheekbone positions
      context.beginPath();
      context.arc(halfwayLeft.x, halfwayLeft.y, 10, 0, 2 * Math.PI);
      context.stroke();

      context.beginPath();
      context.arc(halfwayRight.x, halfwayRight.y, 10, 0, 2 * Math.PI);
      context.stroke();
  }
}