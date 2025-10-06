import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import PomodoroTimer from "./components/pomodoro-timer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main
      className="min-h-dvh bg-white
                
      
                 px-4"
    >
      <PomodoroTimer />
    </main>
  );
}

export default App;
