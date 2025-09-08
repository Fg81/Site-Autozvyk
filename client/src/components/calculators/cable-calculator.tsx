import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateCableGauge } from "@/lib/audio-calculations";
import { useToast } from "@/hooks/use-toast";

export default function CableCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    power: "1000",
    length: "5",
    voltage: "12",
  });
  
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    try {
      const result = calculateCableGauge({
        power: parseFloat(inputs.power),
        length: parseFloat(inputs.length),
        voltage: parseFloat(inputs.voltage),
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
          <span className="text-2xl mr-3">⚡</span>
          Калькулятор сечения силового кабеля
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="power">Мощность системы (Вт RMS)</Label>
              <Input
                id="power"
                type="number"
                value={inputs.power}
                onChange={(e) => setInputs({...inputs, power: e.target.value})}
                placeholder="1000"
                data-testid="power-input"
              />
            </div>
            
            <div>
              <Label htmlFor="length">Длина кабеля (метры)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={inputs.length}
                onChange={(e) => setInputs({...inputs, length: e.target.value})}
                placeholder="5"
                data-testid="length-input"
              />
            </div>
            
            <div>
              <Label htmlFor="voltage">Напряжение системы (В)</Label>
              <Input
                id="voltage"
                type="number"
                value={inputs.voltage}
                onChange={(e) => setInputs({...inputs, voltage: e.target.value})}
                placeholder="12"
                data-testid="voltage-input"
              />
            </div>
            
            <Button onClick={handleCalculate} className="w-full gradient-glow" data-testid="calculate-button">
              Рассчитать сечение
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Результаты расчета</h3>
            {results ? (
              <div className="space-y-4" data-testid="calculation-results">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Ток системы:</span>
                  <span className="font-semibold text-card-foreground">{results.current} А</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Минимальное сечение:</span>
                  <span className="font-semibold text-card-foreground">{results.minGauge} мм²</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Рекомендуемое сечение:</span>
                  <span className="font-semibold text-card-foreground text-primary">{results.recommendedGauge} мм²</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">AWG эквивалент:</span>
                  <span className="font-semibold text-card-foreground">{results.awgEquivalent} AWG</span>
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
                Введите параметры системы и нажмите "Рассчитать сечение" для получения результатов
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
