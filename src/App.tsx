import { useState } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { SimulationScreen } from "./components/SimulationScreen";

export default function App() {
  const [started, setStarted] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  if (!started) {
    return (
      <LandingScreen
        onStart={(type) => {
          setSelectedType(type);
          setStarted(true);
        }}
      />
    );
  }

  return <SimulationScreen chosenType={selectedType} />;
}
