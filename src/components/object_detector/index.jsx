import React, { useRef, useState } from "react";
import "@tensorflow/tfjs-backend-cpu";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "./index.css";

export function ObjectDetector(props) {
  const fileInputRef = useRef();
  const imageRef = useRef();
  const [imgData, setImgData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const isEmptyPredictions = !predictions || predictions.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const normalizePredictions = (predictions, imgSize) => {
    if (!predictions || !imgSize || !imageRef) return predictions || [];
    return predictions.map((prediction) => {
      const { bbox } = prediction;
      const regX = bbox[0];
      const regY = bbox[1];
      const regWidth = bbox[2];
      const regHeight = bbox[3];

      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;

      const x = (regX * imgWidth) / imgSize.width;
      const y = (regY * imgHeight) / imgSize.height;
      const width = (regWidth * imgWidth) / imgSize.width;
      const height = (regHeight * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  const detectObjectsOnImage = async (imageElement, imgSize) => {
    const model = await cocoSsd.load({});
    const predictions = await model.detect(imageElement, 6);
    const normalizedPredictions = normalizePredictions(predictions, imgSize);
    setPredictions(normalizedPredictions);
    console.log("Predictions: ", predictions);
  };

  const readImage = (file) => {
    return new Promise((rs, rj) => {
      const fileReader = new FileReader();
      fileReader.onload = () => rs(fileReader.result);
      fileReader.onerror = () => rj(fileReader.error);
      fileReader.readAsDataURL(file);
    });
  };

  const onSelectImage = async (e) => {
    setPredictions([]);
    setLoading(true);

    const file = e.target.files[0];
    const imgData = await readImage(file);
    setImgData(imgData);

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };
      await detectObjectsOnImage(imageElement, imgSize);
      setLoading(false);
    };
  };

  return (
    <div className= {`object-detector-container ${ObjectDetector}`}>
      <div className = {`detector-container ${ObjectDetector}`}>
        {imgData && 
          <div className ={`target-image ${ObjectDetector}`} src={imgData} ref={imageRef} />
        }
        {!isEmptyPredictions &&
          predictions.map((prediction, idx) => (
            <div className = {`target-box ${ObjectDetector}`}>
              key={idx}
              x={prediction.bbox[0]}
              y={prediction.bbox[1]}
              width={prediction.bbox[2]}
              height={prediction.bbox[3]}
              classType={prediction.class}
              score={prediction.score * 100}
            </ div>
          ))
        } 
      </ div>
      <div className = {`hidden-file-input ${ObjectDetector}`}>
        type="file"
        ref={fileInputRef}
        onChange={onSelectImage}
      </ div>
      <div className= {`select-button ${ObjectDetector}`} onClick={openFilePicker}>
        {isLoading ? "Recognizing..." : "Select Image"}
      </ div>
    </ div>
  );
}
