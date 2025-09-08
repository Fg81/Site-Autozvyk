import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { calculateBoxVolume } from "@/lib/audio-calculations";
import { useToast } from "@/hooks/use-toast";

export default function BoxCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    speakerDiameter: "12",
    boxType: "ported",
    qts: "0.4",
    fs: "35",
    vas: "50",
  });
  
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async () => {
    try {
      const result = calculateBoxVolume({
        speakerDiameter: parseFloat(inputs.speakerDiameter),
        boxType: inputs.boxType as "sealed" | "ported",
        qts: parseFloat(inputs.qts),
        fs: parseFloat(inputs.fs),
        vas: parseFloat(inputs.vas),
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
          <span className="text-2xl mr-3">📦</span>
          Калькулятор короба сабвуфера
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="speakerDiameter">Диаметр динамика (дюймы)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Диаметр диффузора динамика в дюймах. Влияет на объем корпуса.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={inputs.speakerDiameter} onValueChange={(value) => setInputs({...inputs, speakerDiameter: value})}>
                <SelectTrigger data-testid="speaker-diameter-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8" (20 см)</SelectItem>
                  <SelectItem value="10">10" (25 см)</SelectItem>
                  <SelectItem value="12">12" (30 см)</SelectItem>
                  <SelectItem value="15">15" (38 см)</SelectItem>
                  <SelectItem value="18">18" (46 см)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <Label>Тип короба</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Закрытый корпус - более точный бас. Фазоинвертор - больше объема на низких частотах.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={inputs.boxType === "sealed" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, boxType: "sealed"})}
                  className="h-auto p-3"
                  data-testid="box-type-sealed"
                >
                  <div className="text-center">
                    <div className="font-medium">Закрытый</div>
                    <div className="text-sm opacity-70">Герметичный</div>
                  </div>
                </Button>
                <Button
                  variant={inputs.boxType === "ported" ? "default" : "outline"}
                  onClick={() => setInputs({...inputs, boxType: "ported"})}
                  className="h-auto p-3"
                  data-testid="box-type-ported"
                >
                  <div className="text-center">
                    <div className="font-medium">Фазоинвертор</div>
                    <div className="text-sm opacity-70">С портом</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="qts">Qts динамика</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Общая добротность динамика. Обычно от 0.2 до 0.7. Указана в спецификации динамика.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="qts"
                  type="number"
                  step="0.01"
                  value={inputs.qts}
                  onChange={(e) => setInputs({...inputs, qts: e.target.value})}
                  placeholder="0.4"
                  data-testid="qts-input"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="fs">Fs (Гц)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Резонансная частота динамика в герцах. Указана в спецификации. Обычно 20-60 Гц.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="fs"
                  type="number"
                  value={inputs.fs}
                  onChange={(e) => setInputs({...inputs, fs: e.target.value})}
                  placeholder="35"
                  data-testid="fs-input"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="vas">Vas (литры)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Эквивалентный объем воздуха в литрах. Указан в спецификации динамика.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="vas"
                type="number"
                value={inputs.vas}
                onChange={(e) => setInputs({...inputs, vas: e.target.value})}
                placeholder="50"
                data-testid="vas-input"
              />
            </div>
            
            <Button onClick={handleCalculate} className="w-full gradient-glow" data-testid="calculate-button">
              Рассчитать объем
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Результаты расчета</h3>
            {results ? (
              <div className="space-y-4" data-testid="calculation-results">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Внутренний объем:</span>
                  <span className="font-semibold text-card-foreground">{results.volume} л</span>
                </div>
                {results.tuningFrequency && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Частота настройки:</span>
                    <span className="font-semibold text-card-foreground">{results.tuningFrequency} Гц</span>
                  </div>
                )}
                {results.portDimensions && (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Размер порта:</span>
                      <span className="font-semibold text-card-foreground">{results.portDimensions}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted-foreground">Длина порта:</span>
                      <span className="font-semibold text-card-foreground">{results.portLength} см</span>
                    </div>
                  </>
                )}
                
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
                Введите параметры динамика и нажмите "Рассчитать объем" для получения результатов
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
