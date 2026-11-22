import type { UseCaseId } from "@pcb/shared";
import {
  Box,
  BrainCircuit,
  Briefcase,
  Clapperboard,
  Code,
  Crosshair,
  Gamepad2,
  MonitorPlay,
  Radio,
  Tv,
  type LucideIcon,
} from "lucide-react";

export const USE_CASE_ICONS: Record<UseCaseId, LucideIcon> = {
  esports: Crosshair,
  "gaming-1080p": Gamepad2,
  "gaming-1440p": MonitorPlay,
  "gaming-4k": Tv,
  streaming: Radio,
  "video-editing": Clapperboard,
  "3d-design": Box,
  "ai-ml": BrainCircuit,
  coding: Code,
  office: Briefcase,
};

export const DEFAULT_BUDGET: Record<UseCaseId, number> = {
  esports: 70_000,
  "gaming-1080p": 100_000,
  "gaming-1440p": 160_000,
  "gaming-4k": 280_000,
  streaming: 150_000,
  "video-editing": 140_000,
  "3d-design": 170_000,
  "ai-ml": 230_000,
  coding: 80_000,
  office: 50_000,
};

export const BUDGET_PRESETS = [50_000, 75_000, 100_000, 150_000, 200_000, 300_000];
export const BUDGET_MIN = 30_000;
export const BUDGET_MAX = 400_000;
