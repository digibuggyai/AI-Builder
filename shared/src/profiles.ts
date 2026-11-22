import type { Category } from "./types";

export const USE_CASE_IDS = [
  "esports",
  "gaming-1080p",
  "gaming-1440p",
  "gaming-4k",
  "streaming",
  "video-editing",
  "3d-design",
  "ai-ml",
  "coding",
  "office",
] as const;

export type UseCaseId = (typeof USE_CASE_IDS)[number];

export type BudgetSplit = Record<Exclude<Category, "monitor">, number>;

export type UseCase = {
  id: UseCaseId;
  label: string;
  description: string;
  gaming: boolean;
  needsGpu: boolean;
  minVramGb: number;
  minRamGb: number;
  minCores: number;
  minStorageGb: number;
  gpuWeight: number;
  split: BudgetSplit;
};

const gamingSplit: BudgetSplit = {
  cpu: 0.18, motherboard: 0.12, ram: 0.09, gpu: 0.38, storage: 0.07, psu: 0.07, cooler: 0.04, case: 0.05,
};

export const USE_CASES: Record<UseCaseId, UseCase> = {
  esports: {
    id: "esports",
    label: "Esports games",
    description: "Valorant, CS2, Fortnite at high frame rates",
    gaming: true,
    needsGpu: true,
    minVramGb: 6,
    minRamGb: 16,
    minCores: 6,
    minStorageGb: 500,
    gpuWeight: 0.5,
    split: { cpu: 0.22, motherboard: 0.13, ram: 0.1, gpu: 0.28, storage: 0.08, psu: 0.08, cooler: 0.05, case: 0.06 },
  },
  "gaming-1080p": {
    id: "gaming-1080p",
    label: "Gaming at 1080p",
    description: "New games on a Full HD monitor",
    gaming: true,
    needsGpu: true,
    minVramGb: 8,
    minRamGb: 16,
    minCores: 6,
    minStorageGb: 1000,
    gpuWeight: 0.7,
    split: gamingSplit,
  },
  "gaming-1440p": {
    id: "gaming-1440p",
    label: "Gaming at 1440p",
    description: "New games on a QHD monitor at high settings",
    gaming: true,
    needsGpu: true,
    minVramGb: 12,
    minRamGb: 32,
    minCores: 6,
    minStorageGb: 1000,
    gpuWeight: 0.75,
    split: gamingSplit,
  },
  "gaming-4k": {
    id: "gaming-4k",
    label: "Gaming at 4K",
    description: "The heaviest games on a 4K monitor",
    gaming: true,
    needsGpu: true,
    minVramGb: 16,
    minRamGb: 32,
    minCores: 8,
    minStorageGb: 2000,
    gpuWeight: 0.85,
    split: { cpu: 0.17, motherboard: 0.1, ram: 0.08, gpu: 0.45, storage: 0.06, psu: 0.07, cooler: 0.03, case: 0.04 },
  },
  streaming: {
    id: "streaming",
    label: "Gaming and streaming",
    description: "Play and stream to YouTube or Twitch at the same time",
    gaming: true,
    needsGpu: true,
    minVramGb: 8,
    minRamGb: 32,
    minCores: 8,
    minStorageGb: 1000,
    gpuWeight: 0.55,
    split: { cpu: 0.24, motherboard: 0.12, ram: 0.1, gpu: 0.3, storage: 0.08, psu: 0.07, cooler: 0.04, case: 0.05 },
  },
  "video-editing": {
    id: "video-editing",
    label: "Video editing",
    description: "Premiere Pro, DaVinci Resolve, 4K timelines",
    gaming: false,
    needsGpu: true,
    minVramGb: 8,
    minRamGb: 32,
    minCores: 8,
    minStorageGb: 2000,
    gpuWeight: 0.45,
    split: { cpu: 0.26, motherboard: 0.12, ram: 0.14, gpu: 0.24, storage: 0.1, psu: 0.07, cooler: 0.03, case: 0.04 },
  },
  "3d-design": {
    id: "3d-design",
    label: "3D and design",
    description: "Blender, AutoCAD, SketchUp",
    gaming: false,
    needsGpu: true,
    minVramGb: 12,
    minRamGb: 32,
    minCores: 8,
    minStorageGb: 1000,
    gpuWeight: 0.55,
    split: { cpu: 0.24, motherboard: 0.11, ram: 0.13, gpu: 0.3, storage: 0.08, psu: 0.07, cooler: 0.03, case: 0.04 },
  },
  "ai-ml": {
    id: "ai-ml",
    label: "AI and machine learning",
    description: "Running local AI models and training on the GPU",
    gaming: false,
    needsGpu: true,
    minVramGb: 16,
    minRamGb: 32,
    minCores: 8,
    minStorageGb: 2000,
    gpuWeight: 0.8,
    split: { cpu: 0.15, motherboard: 0.1, ram: 0.13, gpu: 0.42, storage: 0.07, psu: 0.07, cooler: 0.02, case: 0.04 },
  },
  coding: {
    id: "coding",
    label: "Programming",
    description: "VS Code, Docker, a browser with many tabs",
    gaming: false,
    needsGpu: false,
    minVramGb: 0,
    minRamGb: 32,
    minCores: 6,
    minStorageGb: 1000,
    gpuWeight: 0.15,
    split: { cpu: 0.32, motherboard: 0.16, ram: 0.18, gpu: 0.04, storage: 0.12, psu: 0.08, cooler: 0.04, case: 0.06 },
  },
  office: {
    id: "office",
    label: "Office and study",
    description: "Documents, browsing, video calls",
    gaming: false,
    needsGpu: false,
    minVramGb: 0,
    minRamGb: 16,
    minCores: 4,
    minStorageGb: 500,
    gpuWeight: 0,
    split: { cpu: 0.3, motherboard: 0.18, ram: 0.14, gpu: 0, storage: 0.14, psu: 0.1, cooler: 0.05, case: 0.09 },
  },
};
