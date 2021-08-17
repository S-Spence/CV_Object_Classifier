import { ObjectDetector }  from "./components/object_detector/detector";
import styled from "styled-components";

const AppFormat = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1c2127;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffff;
`;

function App() {
  return (
    <AppFormat >
        <ObjectDetector />
    </ AppFormat>
  );
}

export default App;
