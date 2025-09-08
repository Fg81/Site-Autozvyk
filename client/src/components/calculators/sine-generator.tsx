import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export default function SineGenerator() {
  const { toast } = useToast();
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState("sine");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      stopTone();
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = async () => {
    try {
      const audioContext = initAudioContext();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Stop any existing oscillator
      stopTone();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = waveform as OscillatorType;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(volume[0] / 100, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      setIsPlaying(true);

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      // Track calculation
      await fetch("/api/calculators/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "Тон воспроизводится",
        description: `Частота: ${frequency} Гц`,
      });
    } catch (error) {
      toast({
        title: "Ошибка воспроизведения",
        description: "Не удалось воспроизвести тон",
        variant: "destructive",
      });
    }
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const updateFrequency = (newFrequency: number) => {
    setFrequency(newFrequency);
    if (oscillatorRef.current && audioContextRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(newFrequency, audioContextRef.current.currentTime);
    }
  };

  const updateVolume = (newVolume: number[]) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume[0] / 100, audioContextRef.current.currentTime);
    }
  };

  const presetFrequencies = [
    { name: "20 Гц", value: 20, description: "Нижний предел слуха" },
    { name: "40 Гц", value: 40, description: "Глубокий бас" },
    { name: "60 Гц", value: 60, description: "Сетевая наводка" },
    { name: "80 Гц", value: 80, description: "Басовый кроссовер" },
    { name: "440 Гц", value: 440, description: "Ля первой октавы" },
    { name: "1000 Гц", value: 1000, description: "Эталонная частота" },
    { name: "2000 Гц", value: 2000, description: "Средние частоты" },
    { name: "8000 Гц", value: 8000, description: "Высокие частоты" },
    { name: "15000 Гц", value: 15000, description: "Верхний предел" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">🎵</span>
          Генератор синусоидальных сигналов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="frequency">Частота (Гц)</Label>
              <Input
                id="frequency"
                type="number"
                min="10"
                max="20000"
                value={frequency}
                onChange={(e) => updateFrequency(parseInt(e.target.value) || 440)}
                placeholder="440"
                data-testid="frequency-input"
              />
            </div>
            
            <div>
              <Label>Громкость: {volume[0]}%</Label>
              <Slider
                value={volume}
                onValueChange={updateVolume}
                max={100}
                step={1}
                className="mt-2"
                data-testid="volume-slider"
              />
            </div>

            <div>
              <Label>Тип сигнала</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={waveform === "sine" ? "default" : "outline"}
                  onClick={() => setWaveform("sine")}
                  className="h-auto p-3"
                  data-testid="waveform-sine"
                >
                  <div className="text-center">
                    <div className="font-medium">Синус</div>
                    <div className="text-sm opacity-70">Чистый тон</div>
                  </div>
                </Button>
                <Button
                  variant={waveform === "square" ? "default" : "outline"}
                  onClick={() => setWaveform("square")}
                  className="h-auto p-3"
                  data-testid="waveform-square"
                >
                  <div className="text-center">
                    <div className="font-medium">Меандр</div>
                    <div className="text-sm opacity-70">Импульсы</div>
                  </div>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={waveform === "triangle" ? "default" : "outline"}
                  onClick={() => setWaveform("triangle")}
                  className="h-auto p-3"
                  data-testid="waveform-triangle"
                >
                  <div className="text-center">
                    <div className="font-medium">Треугольник</div>
                    <div className="text-sm opacity-70">Пилообразный</div>
                  </div>
                </Button>
                <Button
                  variant={waveform === "sawtooth" ? "default" : "outline"}
                  onClick={() => setWaveform("sawtooth")}
                  className="h-auto p-3"
                  data-testid="waveform-sawtooth"
                >
                  <div className="text-center">
                    <div className="font-medium">Пила</div>
                    <div className="text-sm opacity-70">Резкий спад</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={isPlaying ? stopTone : playTone} 
                className={`flex-1 ${isPlaying ? 'bg-destructive hover:bg-destructive/90' : 'gradient-glow'}`}
                data-testid="play-stop-button"
              >
                {isPlaying ? "Остановить" : "Воспроизвести"}
              </Button>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Предупреждение</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Будьте осторожны с уровнем громкости. Начинайте с низких значений.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-6">Предустановленные частоты</h3>
            <div className="space-y-3" data-testid="preset-frequencies">
              {presetFrequencies.map((preset, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => updateFrequency(preset.value)}
                  data-testid={`preset-frequency-${preset.value}`}
                >
                  <div>
                    <div className="font-medium text-card-foreground">{preset.name}</div>
                    <div className="text-sm text-muted-foreground">{preset.description}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Выбрать
                  </Button>
                </div>
              ))}
            </div>

            {/* Waveform visualization */}
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium text-card-foreground mb-3">Форма сигнала</h4>
              <div className="text-center">
                <svg width="200" height="80" className="mx-auto">
                  {waveform === "sine" && (
                    <path
                      d="M 10 40 Q 30 20, 50 40 T 90 40 T 130 40 T 170 40 T 190 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                  {waveform === "square" && (
                    <path
                      d="M 10 60 L 10 20 L 50 20 L 50 60 L 90 60 L 90 20 L 130 20 L 130 60 L 170 60 L 170 20 L 190 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                  {waveform === "triangle" && (
                    <path
                      d="M 10 60 L 30 20 L 50 60 L 70 20 L 90 60 L 110 20 L 130 60 L 150 20 L 170 60 L 190 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                  {waveform === "sawtooth" && (
                    <path
                      d="M 10 60 L 50 20 L 50 60 L 90 20 L 90 60 L 130 20 L 130 60 L 170 20 L 170 60 L 190 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Usage tips */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-card-foreground mb-1">Применение</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Настройка фазы сабвуфера (20-80 Гц)</li>
                    <li>• Поиск резонансов в салоне</li>
                    <li>• Калибровка эквалайзера</li>
                    <li>• Проверка работоспособности динамиков</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
