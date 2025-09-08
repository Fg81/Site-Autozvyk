import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BoxCalculator from "@/components/calculators/box-calculator";
import CableCalculator from "@/components/calculators/cable-calculator";
import SpeakerWiring from "@/components/calculators/speaker-wiring";
import PortCalculator from "@/components/calculators/port-calculator";
import FuseCalculator from "@/components/calculators/fuse-calculator";
import SineGenerator from "@/components/calculators/sine-generator";
import { useState, useEffect } from "react";

export default function Calculators() {
  const [activeCalculator, setActiveCalculator] = useState("box");

  useEffect(() => {
    // Track pageview
    fetch("/api/stats/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview" }),
    }).catch(console.error);

    // Check URL hash
    const hash = window.location.hash.slice(1);
    if (hash && ["box", "cable", "wiring", "port", "fuse", "sine"].includes(hash)) {
      setActiveCalculator(hash);
    }
  }, []);

  const calculators = [
    { id: "box", title: "Расчет короба", icon: "📦" },
    { id: "cable", title: "Сечение кабеля", icon: "⚡" },
    { id: "wiring", title: "Коммутация динамиков", icon: "🔊" },
    { id: "port", title: "Фазоинвертор", icon: "🔧" },
    { id: "fuse", title: "Предохранители", icon: "🔒" },
    { id: "sine", title: "Генератор синуса", icon: "🎵" },
  ];

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "box":
        return <BoxCalculator />;
      case "cable":
        return <CableCalculator />;
      case "wiring":
        return <SpeakerWiring />;
      case "port":
        return <PortCalculator />;
      case "fuse":
        return <FuseCalculator />;
      case "sine":
        return <SineGenerator />;
      default:
        return <BoxCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Расчеты и Калькуляторы
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Профессиональные инструменты для точного расчета параметров автозвуковой системы
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calculator Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Выберите калькулятор
              </h3>
              <nav className="space-y-2">
                {calculators.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => {
                      setActiveCalculator(calc.id);
                      window.location.hash = calc.id;
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCalculator === calc.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-card-foreground hover:bg-accent"
                    }`}
                    data-testid={`calculator-nav-${calc.id}`}
                  >
                    <span className="text-xl mr-3">{calc.icon}</span>
                    {calc.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Calculator Content */}
          <div className="lg:w-3/4">
            {renderCalculator()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
