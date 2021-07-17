// window.onload será triggado pelo browser após ele montar o nosso documento
window.onload = async () => {
  // pega o elemento pela tag 'video' na posição [0], pois sabemos que só tem 1 elemento 'video' e a função getElementsByTagName, retorna um array de elementos.
  const video = document.getElementsByTagName('video')[0];
  
  // variavel da path dos nossos models
  const MODEL_URL = '../libs/models';

  // await vai tornar o carregamento synchrono e vai esperar o modulo carregar
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

  video.addEventListener("playing", () => {

    // cria um elemento canvas pelo faceapi
    const canvas = faceapi.createCanvasFromMedia(video);

    // adiciona o elemento canvas ao nosso documento
    document.body.append(canvas);

    // pega as dimensões do nosso elemento video
    const displaySize = { width: video.width, height: video.height };

    // passamos as dimensões para o match Dimensions do faceApi
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 1000);
  });

  // try irá executar o bloco dentro dele e caso haja algum erro ele vai passar ao catch e avisar ao invés de quebrar a aplicação.
  try {
    // navigator.mediaDevices.getUserMedia  irá solicitar permissão para acessar a minha webcam e irá retornar a media caso permitido. 
    // navigator https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    stream = await navigator.mediaDevices.getUserMedia({ video: {} });

    // video.srcObject = stream - estamos atribuindo ao nosso elemento video a variavel 'stream'
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
    video.srcObject = stream;
  } catch(err) {
    console.log(err);
    alert('Falha ao carregar webcam, verifique suas permissões');
  }
};