import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateSpeakerWiring } from "@/lib/audio-calculations";
import { useToast } from "@/hooks/use-toast";

export default function SpeakerWiring() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    speakerCount: "2",
    speakerImpedance: "4",
    wiringType: "parallel",
  });
  
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    try {
      const result = calculateSpeakerWiring({
        speakerCount: parseInt(inputs.speakerCount),
        speakerImpedance: parseFloat(inputs.speakerImpedance),
        wiringType: inputs.wiringType as "parallel" | "series",
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
          <span className="text-2xl mr-3">🔊</span>
          Калькулятор коммутации динамиков
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="speakerCount">Количество динамиков</Label>
              <Select value={inputs.speakerCount} onValueChange={(value) => setInputs({...inputs, speakerCount: value})}>
                <SelectTrigger data-testid="speaker-count-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 динамика</SelectItem>
                  <SelectItem value="4">4 динамика</SelectItem>
                  <SelectItem value="6">6 динамиков</SelectItem>
                  <SelectItem value="8">8 динамиков</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="speakerImpedance">Импеданс каждого динамика (Ом)</Label>
              <Select value={inputs.speakerImpedance} onValueChange={(value) => setInputs({...inputs, speakerImpedance: value})}>
                <SelectTrigger data-testid="speaker-impedance-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Ом</SelectItem>
                  <SelectItem value="4">4 Ом</SelectItem>
                  <SelectItem value="8">8 Ом</SelectItem>
                  <SelectItem value="16">16 Ом</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Тип подключения</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={inputs.wiringType === "parallel" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, wiringType: "parallel"})}
                  className="h-auto p-3"
                  data-testid="wiring-type-parallel"
                >
                  <div className="text-center">
                    <div className="font-medium">Параллельно</div>
                    <div className="text-sm opacity-70">Низкий импеданс</div>
                  </div>
                </Button>
                <Button
                  variant={inputs.wiringType === "series" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, wiringType: "series"})}
                  className="h-auto p-3"
                  data-testid="wiring-type-series"
                >
                  <div className="text-center">
                    <div className="font-medium">Последовательно</div>
                    <div className="text-sm opacity-70">Высокий импеданс</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <Button onClick={handleCalculate} className="w-full gradient-glow" data-testid="calculate-button">
              Рассчитать импеданс
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Результаты расчета</h3>
            {results ? (
              <div className="space-y-4" data-testid="calculation-results">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Итоговый импеданс:</span>
                  <span className="font-semibold text-card-foreground text-primary">{results.totalImpedance} Ом</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Тип подключения:</span>
                  <span className="font-semibold text-card-foreground">
                    {results.wiringType === "parallel" ? "Параллельное" : "Последовательное"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Мощность на динамик:</span>
                  <span className="font-semibold text-card-foreground">{results.powerPerSpeaker}%</span>
                </div>
                
                {/* Wiring Diagram */}
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-3">Схема подключения</h4>
                  <div className="text-center">
                    <svg width="200" height="100" className="mx-auto">
                      {results.wiringType === "parallel" ? (
                        // Parallel wiring diagram
                        <>
                          <line x1="20" y1="30" x2="180" y2="30" stroke="currentColor" strokeWidth="2"/>
                          <line x1="20" y1="70" x2="180" y2="70" stroke="currentColor" strokeWidth="2"/>
                          <line x1="20" y1="30" x2="20" y2="70" stroke="currentColor" strokeWidth="2"/>
                          <line x1="180" y1="30" x2="180" y2="70" stroke="currentColor" strokeWidth="2"/>
                          {Array.from({length: parseInt(inputs.speakerCount)}, (_, i) => (
                            <g key={i}>
                              <rect 
                                x={40 + i * 30} 
                                y={40} 
                                width={20} 
                                height={20} 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1"
                              />
                              <text x={50 + i * 30} y={53} fontSize="8" textAnchor="middle" fill="currentColor">
                                {inputs.speakerImpedance}Ω
                              </text>
                            </g>
                          ))}
                        </>
                      ) : (
                        // Series wiring diagram
                        <>
                          <line x1="20" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="2"/>
                          <line x1="160" y1="50" x2="180" y2="50" stroke="currentColor" strokeWidth="2"/>
                          {Array.from({length: parseInt(inputs.speakerCount)}, (_, i) => (
                            <g key={i}>
                              <rect 
                                x={40 + i * 30} 
                                y={40} 
                                width={20} 
                                height={20} 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1"
                              />
                              <text x={50 + i * 30} y={53} fontSize="8" textAnchor="middle" fill="currentColor">
                                {inputs.speakerImpedance}Ω
                              </text>
                              {i < parseInt(inputs.speakerCount) - 1 && (
                                <line 
                                  x1={60 + i * 30} 
                                  y1="50" 
                                  x2={70 + i * 30} 
                                  y2="50" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                />
                              )}
                            </g>
                          ))}
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
                Выберите параметры подключения и нажмите "Рассчитать импеданс" для получения результатов
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
