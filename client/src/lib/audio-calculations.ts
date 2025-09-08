// Audio calculation utilities for car audio systems

export interface BoxCalculationParams {
  speakerDiameter: number; // inches
  boxType: "sealed" | "ported";
  qts: number;
  fs: number; // Hz
  vas: number; // liters
}

export interface CableCalculationParams {
  power: number; // watts RMS
  length: number; // meters
  voltage: number; // volts
}

export interface SpeakerWiringParams {
  speakerCount: number;
  speakerImpedance: number; // ohms
  wiringType: "parallel" | "series";
}

export interface PortCalculationParams {
  boxVolume: number; // liters
  tuningFrequency: number; // Hz
  portType: "round" | "rectangular";
  portDiameter?: number; // cm
  portWidth?: number; // cm
  portHeight?: number; // cm
}

export interface FuseCalculationParams {
  power: number; // watts RMS
  voltage: number; // volts
  efficiency: number; // percentage
  safetyFactor: number; // percentage
}

export function calculateBoxVolume(params: BoxCalculationParams) {
  const { speakerDiameter, boxType, qts, fs, vas } = params;
  
  let volume: number;
  let tuningFrequency: number | undefined;
  let portDimensions: string | undefined;
  let portLength: number | undefined;
  let recommendation: string;

  if (boxType === "sealed") {
    // Sealed box calculation: Vb = Vas / ((Qtc/Qts)^2 - 1)
    // Using Qtc = 0.707 for optimal response
    const qtc = 0.707;
    volume = Math.round(vas / (Math.pow(qtc / qts, 2) - 1) * 10) / 10;
    
    recommendation = `Для ${speakerDiameter}" динамика рекомендуется использовать МДФ толщиной 18-22 мм и внутреннее демпфирование.`;
  } else {
    // Ported box calculation
    volume = Math.round(vas * 1.4 * 10) / 10; // Approximate ported volume
    tuningFrequency = Math.round(fs * 0.8); // Typical tuning
    
    // Port calculations
    const portArea = volume * 16; // cm²
    if (portArea > 0) {
      portDimensions = "10×15";
      portLength = Math.round(2143 * Math.sqrt(portArea) / (tuningFrequency * Math.sqrt(volume)) * 10) / 10;
    }
    
    recommendation = `Фазоинверторный короб обеспечит более глубокий бас. Убедитесь в правильной настройке порта.`;
  }

  return {
    volume: volume.toString(),
    tuningFrequency: tuningFrequency?.toString(),
    portDimensions,
    portLength: portLength?.toString(),
    recommendation,
  };
}

export function calculateCableGauge(params: CableCalculationParams) {
  const { power, length, voltage } = params;
  
  // Calculate current draw (assuming 80% efficiency)
  const current = Math.round((power / voltage / 0.8) * 10) / 10;
  
  // Calculate minimum gauge based on current density (3A per mm²)
  const minGauge = Math.ceil(current / 3);
  
  // Add 50% safety margin
  const recommendedGauge = Math.ceil(minGauge * 1.5);
  
  // AWG conversion (approximate)
  const awgTable = [
    { gauge: 1, awg: "18" },
    { gauge: 2, awg: "16" },
    { gauge: 4, awg: "12" },
    { gauge: 6, awg: "10" },
    { gauge: 10, awg: "8" },
    { gauge: 16, awg: "6" },
    { gauge: 25, awg: "4" },
    { gauge: 35, awg: "2" },
    { gauge: 50, awg: "1/0" },
    { gauge: 70, awg: "2/0" },
  ];
  
  const awgEquivalent = awgTable.find(entry => entry.gauge >= recommendedGauge)?.awg || "0/0";
  
  const recommendation = length > 5 
    ? "Для длинных трасс рассмотрите использование кабеля большего сечения"
    : "Стандартное сечение подходит для данной длины";

  return {
    current: current.toString(),
    minGauge: minGauge.toString(),
    recommendedGauge: recommendedGauge.toString(),
    awgEquivalent,
    recommendation,
  };
}

export function calculateSpeakerWiring(params: SpeakerWiringParams) {
  const { speakerCount, speakerImpedance, wiringType } = params;
  
  let totalImpedance: number;
  let powerPerSpeaker: number;
  let recommendation: string;

  if (wiringType === "parallel") {
    totalImpedance = speakerImpedance / speakerCount;
    powerPerSpeaker = 100; // Each speaker gets full power in parallel
    recommendation = "Параллельное подключение снижает импеданс. Убедитесь, что усилитель стабилен на данной нагрузке.";
  } else {
    totalImpedance = speakerImpedance * speakerCount;
    powerPerSpeaker = Math.round(100 / speakerCount);
    recommendation = "Последовательное подключение увеличивает импеданс и снижает мощность на каждый динамик.";
  }

  return {
    totalImpedance: totalImpedance.toString(),
    wiringType,
    powerPerSpeaker: powerPerSpeaker.toString(),
    recommendation,
  };
}

export function calculatePortDimensions(params: PortCalculationParams) {
  const { boxVolume, tuningFrequency, portType, portDiameter, portWidth, portHeight } = params;
  
  let portArea: number;
  let portLength: number;
  let airVelocity: number;
  let recommendation: string;

  if (portType === "round" && portDiameter) {
    portArea = Math.PI * Math.pow(portDiameter / 2, 2);
  } else if (portType === "rectangular" && portWidth && portHeight) {
    portArea = portWidth * portHeight;
  } else {
    throw new Error("Invalid port parameters");
  }

  // Port length calculation: L = (2143 * √A) / (F * √V) - 1.463 * √A
  const sqrtArea = Math.sqrt(portArea);
  const sqrtVolume = Math.sqrt(boxVolume * 1000); // Convert to cm³
  portLength = Math.round(((2143 * sqrtArea) / (tuningFrequency * sqrtVolume) - 1.463 * sqrtArea) * 10) / 10;
  
  // Air velocity calculation (approximate)
  airVelocity = Math.round((17 * sqrtVolume / sqrtArea) * 10) / 10;
  
  if (airVelocity > 30) {
    recommendation = "Скорость воздуха слишком высока. Увеличьте площадь порта для снижения турбулентности.";
  } else if (airVelocity < 15) {
    recommendation = "Скорость воздуха оптимальна. Порт будет работать эффективно без шумов.";
  } else {
    recommendation = "Скорость воздуха приемлема, но желательно увеличить площадь порта.";
  }

  return {
    portLength: Math.max(portLength, 5).toString(), // Minimum 5cm
    portArea: Math.round(portArea * 10) / 10,
    airVelocity: airVelocity.toString(),
    portType,
    recommendation,
  };
}

export function calculateFuseRating(params: FuseCalculationParams) {
  const { power, voltage, efficiency, safetyFactor } = params;
  
  // Calculate actual current draw
  const currentDraw = Math.round((power / voltage / (efficiency / 100)) * 10) / 10;
  
  // Apply safety factor
  const calculatedFuse = Math.round(currentDraw * (safetyFactor / 100) * 10) / 10;
  
  // Standard fuse ratings
  const standardRatings = [30, 40, 50, 60, 80, 100, 125, 150, 175, 200, 225, 250, 300];
  const recommendedFuse = standardRatings.find(rating => rating >= calculatedFuse) || standardRatings[standardRatings.length - 1];
  
  // Determine fuse type
  let fuseType: string;
  if (recommendedFuse <= 60) {
    fuseType = "MIDI/ATC";
  } else if (recommendedFuse <= 200) {
    fuseType = "ANL";
  } else {
    fuseType = "MEGA/AMG";
  }
  
  const recommendation = `Используйте предохранитель типа ${fuseType}. Установите как можно ближе к аккумулятору.`;
  
  // Generate standard ratings with recommendation
  const ratingsWithRecommendation = standardRatings.slice(0, 9).map(rating => ({
    value: rating,
    recommended: rating === recommendedFuse,
  }));

  return {
    currentDraw: currentDraw.toString(),
    calculatedFuse: calculatedFuse.toString(),
    recommendedFuse: recommendedFuse.toString(),
    fuseType,
    recommendation,
    standardRatings: ratingsWithRecommendation,
  };
}
