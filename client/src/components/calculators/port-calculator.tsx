import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculatePortDimensions } from "@/lib/audio-calculations";
import { useToast } from "@/hooks/use-toast";

export default function PortCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    boxVolume: "45",
    tuningFrequency: "35",
    portType: "round",
    portDiameter: "10",
    portWidth: "10",
    portHeight: "15",
  });
  
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    try {
      const result = calculatePortDimensions({
        boxVolume: parseFloat(inputs.boxVolume),
        tuningFrequency: parseFloat(inputs.tuningFrequency),
        portType: inputs.portType as "round" | "rectangular",
        portDiameter: parseFloat(inputs.portDiameter),
        portWidth: parseFloat(inputs.portWidth),
        portHeight: parseFloat(inputs.portHeight),
      });
      
      setResults(result);
      
      // Track calculation
      await fetch("/api/calculators/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      toast({
        title: "Расчет выполнен",
        description: "Результаты отображены справа",
      });
    } catch (error) {
      toast({
        title: "Ошибка расчета",
        description: "Проверьте введенные данные",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">🔧</span>
          Калькулятор фазоинвертора
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="boxVolume">Объем короба (литры)</Label>
              <Input
                id="boxVolume"
                type="number"
                step="0.1"
                value={inputs.boxVolume}
                onChange={(e) => setInputs({...inputs, boxVolume: e.target.value})}
                placeholder="45"
                data-testid="box-volume-input"
              />
            </div>
            
            <div>
              <Label htmlFor="tuningFrequency">Частота настройки (Гц)</Label>
              <Input
                id="tuningFrequency"
                type="number"
                value={inputs.tuningFrequency}
                onChange={(e) => setInputs({...inputs, tuningFrequency: e.target.value})}
                placeholder="35"
                data-testid="tuning-frequency-input"
              />
            </div>
            
            <div>
              <Label>Тип порта</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={inputs.portType === "round" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, portType: "round"})}
                  className="h-auto p-3"
                  data-testid="port-type-round"
                >
                  <div className="text-center">
                    <div className="font-medium">Круглый</div>
                    <div className="text-sm opacity-70">Труба</div>
                  </div>
                </Button>
                <Button
                  variant={inputs.portType === "rectangular" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, portType: "rectangular"})}
                  className="h-auto p-3"
                  data-testid="port-type-rectangular"
                >
                  <div className="text-center">
                    <div className="font-medium">Прямоугольный</div>
                    <div className="text-sm opacity-70">Щель</div>
                  </div>
                </Button>
              </div>
            </div>
            
            {inputs.portType === "round" ? (
              <div>
                <Label htmlFor="portDiameter">Диаметр порта (см)</Label>
                <Input
                  id="portDiameter"
                  type="number"
                  step="0.1"
                  value={inputs.portDiameter}
                  onChange={(e) => setInputs({...inputs, portDiameter: e.target.value})}
                  placeholder="10"
                  data-testid="port-diameter-input"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portWidth">Ширина порта (см)</Label>
                  <Input
                    id="portWidth"
                    type="number"
                    step="0.1"
                    value={inputs.portWidth}
                    onChange={(e) => setInputs({...inputs, portWidth: e.target.value})}
                    placeholder="10"
                    data-testid="port-width-input"
                  />
                </div>
                <div>
                  <Label htmlFor="portHeight">Высота порта (см)</Label>
                  <Input
                    id="portHeight"
                    type="number"
                    step="0.1"
                    value={inputs.portHeight}
                    onChange={(e) => setInputs({...inputs, portHeight: e.target.value})}
                    placeholder="15"
                    data-testid="port-height-input"
                  />
                </div>
              </div>
            )}
            
            <Button onClick={handleCalculate} className="w-full gradient-glow" data-testid="calculate-button">
              Рассчитать длину порта
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Результаты расчета</h3>
            {results ? (
              <div className="space-y-4" data-testid="calculation-results">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Длина порта:</span>
                  <span className="font-semibold text-card-foreground text-primary">{results.portLength} см</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Площадь порта:</span>
                  <span className="font-semibold text-card-foreground">{results.portArea} см²</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Скорость воздуха:</span>
                  <span className="font-semibold text-card-foreground">{results.airVelocity} м/с</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Тип порта:</span>
                  <span className="font-semibold text-card-foreground">
                    {results.portType === "round" ? "Круглый" : "Прямоугольный"}
                  </span>
                </div>
                
                {/* Port visualization */}
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-3">Визуализация порта</h4>
                  <div className="text-center">
                    <svg width="200" height="120" className="mx-auto">
                      {inputs.portType === "round" ? (
                        // Round port
                        <>
                          <rect x="50" y="40" width="100" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="100" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                          <line x1="115" y1="60" x2="170" y2="60" stroke="currentColor" strokeWidth="2" />
                          <text x="100" y="100" fontSize="10" textAnchor="middle" fill="currentColor">
                            ⌀{inputs.portDiameter}см
                          </text>
                          <text x="142" y="55" fontSize="10" textAnchor="middle" fill="currentColor">
                            {results.portLength}см
                          </text>
                        </>
                      ) : (
                        // Rectangular port
                        <>
                          <rect x="50" y="40" width="100" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
                          <rect x="95" y="50" width="10" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                          <line x1="105" y1="60" x2="170" y2="60" stroke="currentColor" strokeWidth="2" />
                          <text x="100" y="100" fontSize="10" textAnchor="middle" fill="currentColor">
                            {inputs.portWidth}×{inputs.portHeight}см
                          </text>
                          <text x="137" y="55" fontSize="10" textAnchor="middle" fill="currentColor">
                            {results.portLength}см
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-card-foreground mb-1">Рекомендация</h4>
                      <p className="text-sm text-muted-foreground">{results.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Введите параметры короба и нажмите "Рассчитать длину порта" для получения результатов
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
