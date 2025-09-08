import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateFuseRating } from "@/lib/audio-calculations";
import { useToast } from "@/hooks/use-toast";

export default function FuseCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    power: "1000",
    voltage: "12",
    efficiency: "85",
    safetyFactor: "125",
  });
  
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    try {
      const result = calculateFuseRating({
        power: parseFloat(inputs.power),
        voltage: parseFloat(inputs.voltage),
        efficiency: parseFloat(inputs.efficiency),
        safetyFactor: parseFloat(inputs.safetyFactor),
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
          <span className="text-2xl mr-3">🔒</span>
          Калькулятор силовых предохранителей
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
              <Label htmlFor="voltage">Напряжение системы (В)</Label>
              <Select value={inputs.voltage} onValueChange={(value) => setInputs({...inputs, voltage: value})}>
                <SelectTrigger data-testid="voltage-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12В (стандарт)</SelectItem>
                  <SelectItem value="24">24В (грузовик)</SelectItem>
                  <SelectItem value="48">48В (электромобиль)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="efficiency">КПД усилителя (%)</Label>
              <Select value={inputs.efficiency} onValueChange={(value) => setInputs({...inputs, efficiency: value})}>
                <SelectTrigger data-testid="efficiency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60% (класс AB)</SelectItem>
                  <SelectItem value="75">75% (класс AB улучшенный)</SelectItem>
                  <SelectItem value="85">85% (класс D)</SelectItem>
                  <SelectItem value="90">90% (класс D топовый)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="safetyFactor">Коэффициент безопасности (%)</Label>
              <Select value={inputs.safetyFactor} onValueChange={(value) => setInputs({...inputs, safetyFactor: value})}>
                <SelectTrigger data-testid="safety-factor-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="110">110% (минимум)</SelectItem>
                  <SelectItem value="125">125% (рекомендуемый)</SelectItem>
                  <SelectItem value="150">150% (консервативный)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleCalculate} className="w-full gradient-glow" data-testid="calculate-button">
              Рассчитать предохранитель
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Результаты расчета</h3>
            {results ? (
              <div className="space-y-4" data-testid="calculation-results">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Потребляемый ток:</span>
                  <span className="font-semibold text-card-foreground">{results.currentDraw} А</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Расчетный номинал:</span>
                  <span className="font-semibold text-card-foreground">{results.calculatedFuse} А</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Рекомендуемый номинал:</span>
                  <span className="font-semibold text-card-foreground text-primary">{results.recommendedFuse} А</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Тип предохранителя:</span>
                  <span className="font-semibold text-card-foreground">{results.fuseType}</span>
                </div>
                
                {/* Fuse types table */}
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-3">Стандартные номиналы</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-muted-foreground">ANL</div>
                    <div className="font-medium text-muted-foreground">MIDI</div>
                    <div className="font-medium text-muted-foreground">MEGA</div>
                    {results.standardRatings.map((rating: any, index: number) => (
                      <div key={index} className={`${rating.recommended ? 'text-primary font-semibold' : 'text-card-foreground'}`}>
                        {rating.value}А
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Installation tips */}
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-card-foreground mb-1">Рекомендации по установке</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Устанавливайте предохранитель как можно ближе к аккумулятору</li>
                        <li>• Используйте качественные держатели предохранителей</li>
                        <li>• Проверяйте затяжку соединений каждые 6 месяцев</li>
                        <li>• {results.recommendation}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Введите параметры системы и нажмите "Рассчитать предохранитель" для получения результатов
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
