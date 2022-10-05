import logo from './logo.svg';
import './App.css';
import QRCode from "react-qr-code";

function App() {
  return (
    <div style={{margin:"10%"}}>
    <QRCode
    size={256}
    style={{ height: "50%",  }}
    fgColor="#406f96"
    value={"https://www.youtube.com/watch?v=na4Rlxn3WJQ"}
    viewBox={`0 0 256 256`}></QRCode>
    </div>
  );
}

export default App;
