// window.onload será triggado pelo browser após ele montar o nosso documento
window.onload = async () => {
  // pega o elemento pela tag 'video' na posição [0], pois sabemos que só tem 1 elemento 'video' e a função getElementsByTagName, retorna um array de elementos.
  const video = document.getElementsByTagName('video')[0];
  const canvasPlaceholder = document.getElementById('canvas-placeholder');

  // variavel da path dos nossos models
  const MODEL_URL = '../libs/models';

  // await vai tornar o carregamento synchrono e vai esperar o modulo carregar
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  
  // começamos a escutar pelo evento de "playing" do elemento vídeo, para que possamos começar a detectar as faces no vídeo.
  video.addEventListener("playing", () => {
    // cria um elemento canvas pelo faceapi
    const canvas = faceapi.createCanvasFromMedia(video);

    // adiciona o elemento canvas ao nosso canvasPlaceholder
    canvasPlaceholder.append(canvas);

    //pegamos as dimensões do nosso elemento vídeo.
    const videoBoundingClientRect = video.getBoundingClientRect();

    // passamos as dimensões para o match Dimensions do faceApi
    faceapi.matchDimensions(canvas, videoBoundingClientRect);

    // criamos um intervalo que vai repetir a cada 100ms
    setInterval(async () => {
      // realizamos as detecções
      const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
    
      // se não detectamos nada, retornamos para não seguir com a lógica
      if (!result) return;
    
      // pegamos o resultado das detecções
      const resizedDetections = faceapi.resizeResults(result, videoBoundingClientRect);

      // limpamos o nosso canvas
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      // desenhamos novamente os pontilhados no rosto
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // extraimos a idade, genero e expressão da detecção
      const { age, gender, expressions } = resizedDetections

      // escrevemos o resultado
      new faceapi.draw.DrawTextField(
        [
          `Gender: ${gender}`,
          `Age: ${parseInt(age)}`,
          `Expression: ${expressionAccuracy(expressions)}`
        ],
        result.detection.box.bottomLeft
      ).draw(canvas)
    }, 100);
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

// função que retorna o maior valor de um objeto
const expressionAccuracy = function(expressions) {
  return Object.keys(expressions).reduce(function(a, b){ return expressions[a] > expressions[b] ? a : b });
};