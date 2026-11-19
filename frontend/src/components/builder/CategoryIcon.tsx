import type { Category } from "@pcb/shared";
import { Box, CircuitBoard, Cpu, Fan, Gpu, HardDrive, MemoryStick, Monitor, Zap, type LucideIcon } from "lucide-react";

const icons: Record<Category, LucideIcon> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Gpu,
  storage: HardDrive,
  psu: Zap,
  cooler: Fan,
  case: Box,
  monitor: Monitor,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = icons[category];
  return <Icon className={className} aria-hidden />;
}
