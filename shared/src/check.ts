import type { Build, Category, Issue, PartByCategory } from "./types";

export function estimateWattage(build: Build): number {
  const cpu = build.cpu ? Math.round(build.cpu.tdpW * 1.3) : 0;
  const gpu = build.gpu?.tdpW ?? 0;
  const rest = build.cpu || build.gpu ? 75 : 0;
  return cpu + gpu + rest;
}

export function checkBuild(build: Build): Issue[] {
  const issues: Issue[] = [];
  const add = (level: Issue["level"], code: string, parts: Category[], message: string) =>
    issues.push({ level, code, parts, message });

  const { cpu, gpu, motherboard: board, ram, storage, psu, cooler, case: pcCase } = build;

  if (cpu && board && cpu.socket !== board.socket) {
    add("error", "cpu-socket", ["cpu", "motherboard"],
      `${cpu.name} needs a ${cpu.socket} motherboard, but this board is ${board.socket}.`);
  }
  if (ram && board && ram.memoryType !== board.memoryType) {
    add("error", "ram-type", ["ram", "motherboard"],
      `This motherboard takes ${board.memoryType} memory, but the RAM is ${ram.memoryType}.`);
  }
  if (cpu && ram && !cpu.memoryTypes.includes(ram.memoryType)) {
    add("error", "cpu-ram-type", ["cpu", "ram"],
      `${cpu.name} supports ${cpu.memoryTypes.join(" and ")} only, not ${ram.memoryType}.`);
  }
  if (ram && board && ram.modules > board.ramSlots) {
    add("error", "ram-slots", ["ram", "motherboard"],
      `This RAM kit has ${ram.modules} sticks, but the motherboard has only ${board.ramSlots} slots.`);
  }
  if (ram && board && ram.capacityGb > board.maxRamGb) {
    add("error", "ram-capacity", ["ram", "motherboard"],
      `The motherboard supports up to ${board.maxRamGb} GB, but this kit is ${ram.capacityGb} GB.`);
  }
  if (storage && board && storage.type === "NVMe" && board.m2Slots === 0) {
    add("error", "storage-m2", ["storage", "motherboard"],
      `NVMe drives need an M.2 slot, and this motherboard has none.`);
  }

  if (pcCase && board && !pcCase.motherboardSupport.includes(board.formFactor)) {
    add("error", "case-board", ["case", "motherboard"],
      `A ${board.formFactor} motherboard doesn't fit this case. It takes ${pcCase.motherboardSupport.join(", ")}.`);
  }
  if (pcCase && gpu) {
    const spare = pcCase.maxGpuLengthMm - gpu.lengthMm;
    if (spare < 0) {
      add("error", "case-gpu", ["case", "gpu"],
        `The GPU is ${gpu.lengthMm} mm long, but this case fits up to ${pcCase.maxGpuLengthMm} mm.`);
    } else if (spare < 15) {
      add("warning", "case-gpu-tight", ["case", "gpu"],
        `The GPU fits with only ${spare} mm to spare. Cables may be tight.`);
    }
  }
  if (pcCase && cooler?.type === "Air" && cooler.heightMm != null && cooler.heightMm > pcCase.maxCoolerHeightMm) {
    add("error", "case-cooler", ["case", "cooler"],
      `The cooler is ${cooler.heightMm} mm tall, but this case fits up to ${pcCase.maxCoolerHeightMm} mm.`);
  }
  if (pcCase && cooler?.type === "Liquid" && cooler.radiatorMm != null &&
      !pcCase.radiatorSupportMm.includes(cooler.radiatorMm)) {
    add("error", "case-radiator", ["case", "cooler"],
      `This case has no room for a ${cooler.radiatorMm} mm radiator.`);
  }
  if (pcCase && psu && !pcCase.psuSupport.includes(psu.formFactor)) {
    add("error", "case-psu", ["case", "psu"],
      `This case doesn't take an ${psu.formFactor} power supply.`);
  }

  if (cpu && cooler && !cooler.sockets.includes(cpu.socket)) {
    add("error", "cooler-socket", ["cpu", "cooler"],
      `This cooler doesn't mount on ${cpu.socket} CPUs.`);
  }
  if (cpu && cooler) {
    if (cooler.tdpRatingW < cpu.tdpW) {
      add("error", "cooler-tdp", ["cpu", "cooler"],
        `${cpu.name} makes ${cpu.tdpW} W of heat, but this cooler handles only ${cooler.tdpRatingW} W.`);
    } else if (cooler.tdpRatingW < cpu.tdpW * 1.25) {
      add("warning", "cooler-tdp-tight", ["cpu", "cooler"],
        `This cooler is just enough for ${cpu.name}. Expect more fan noise under load.`);
    }
  }

  if (psu && (cpu || gpu)) {
    const need = estimateWattage(build);
    if (psu.wattage < need) {
      add("error", "psu-low", ["psu", "gpu"],
        `This build needs about ${need} W, but the power supply gives ${psu.wattage} W.`);
    } else if (gpu && psu.wattage < gpu.recommendedPsuW) {
      add("warning", "psu-gpu-recommended", ["psu", "gpu"],
        `The GPU maker recommends at least a ${gpu.recommendedPsuW} W power supply.`);
    } else if (psu.wattage < need * 1.3) {
      add("warning", "psu-headroom", ["psu"],
        `Little spare power: about ${need} W of ${psu.wattage} W. Aim for 30% extra.`);
    }
  }

  if (cpu && !gpu && !cpu.hasIntegratedGraphics) {
    add("warning", "cpu-no-graphics", ["cpu", "gpu"],
      `${cpu.name} has no built-in graphics. Add a graphics card, or the screen stays blank.`);
  }

  return issues;
}

export function problemsIfChosen<C extends Category>(
  build: Build,
  category: C,
  part: PartByCategory[C],
): Issue[] {
  return checkBuild({ ...build, [category]: part }).filter(
    (issue) => issue.level === "error" && issue.parts.includes(category),
  );
}
