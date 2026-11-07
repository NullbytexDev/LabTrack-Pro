import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EMPTY_CONFIG = {
  os: '',
  os_version: '',
  ram_gb: '',
  storage_gb: '',
  storage_type: '',
  cpu_brand: '',
  cpu_model: '',
};

export const OS_OPTIONS = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
];

export const STORAGE_OPTIONS = [
  { value: 'ssd', label: 'SSD' },
  { value: 'hdd', label: 'Hard disk' },
];

export const CPU_BRAND_OPTIONS = [
  { value: 'intel', label: 'Intel' },
  { value: 'amd', label: 'AMD' },
  { value: 'apple', label: 'Apple' },
  { value: 'other', label: 'Other' },
];

// Suggestions only — the model field accepts anything typed in.
export const CPU_MODELS = {
  intel: ['Core i3-12100', 'Core i5-12400', 'Core i5-13400', 'Core i7-12700', 'Core i7-13700', 'Core i9-13900'],
  amd: ['Ryzen 3 5300G', 'Ryzen 5 5600G', 'Ryzen 5 7600', 'Ryzen 7 5800X', 'Ryzen 7 7700', 'Ryzen 9 7900'],
  apple: ['Apple M1', 'Apple M2', 'Apple M3', 'Apple M4'],
  other: [],
};

export function configurationSummary(pc) {
  if (!pc) return '';
  const parts = [];
  const osLabel = OS_OPTIONS.find((option) => option.value === pc.os)?.label;
  if (osLabel) parts.push(`${osLabel}${pc.os_version ? ` ${pc.os_version}` : ''}`);
  if (pc.ram_gb) parts.push(`${pc.ram_gb} GB RAM`);
  if (pc.storage_gb) {
    const type = STORAGE_OPTIONS.find((option) => option.value === pc.storage_type)?.label;
    parts.push(`${pc.storage_gb} GB${type ? ` ${type}` : ''}`);
  }
  const brand = CPU_BRAND_OPTIONS.find((option) => option.value === pc.cpu_brand)?.label;
  if (brand || pc.cpu_model) parts.push([brand, pc.cpu_model].filter(Boolean).join(' '));
  return parts.join(' · ');
}

export default function PcConfigFields({ value, onChange, disabled }) {
  const models = CPU_MODELS[value.cpu_brand] || [];

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium">Configuration</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pc-os">Operating system</Label>
          <Select value={value.os || 'unset'} onValueChange={(next) => onChange('os', next === 'unset' ? '' : next)}>
            <SelectTrigger id="pc-os" aria-label="Operating system">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set</SelectItem>
              {OS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-os-version">OS version</Label>
          <Input
            id="pc-os-version"
            value={value.os_version}
            onChange={(event) => onChange('os_version', event.target.value)}
            placeholder="11 Pro, Sequoia, 24.04"
            maxLength={40}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-ram">RAM (GB)</Label>
          <Input
            id="pc-ram"
            type="number"
            min="1"
            max="8192"
            value={value.ram_gb}
            onChange={(event) => onChange('ram_gb', event.target.value)}
            placeholder="16"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-storage">Storage (GB)</Label>
          <Input
            id="pc-storage"
            type="number"
            min="1"
            max="8192"
            value={value.storage_gb}
            onChange={(event) => onChange('storage_gb', event.target.value)}
            placeholder="512"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-storage-type">Storage type</Label>
          <Select
            value={value.storage_type || 'unset'}
            onValueChange={(next) => onChange('storage_type', next === 'unset' ? '' : next)}
          >
            <SelectTrigger id="pc-storage-type" aria-label="Storage type">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set</SelectItem>
              {STORAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-cpu-brand">Processor brand</Label>
          <Select
            value={value.cpu_brand || 'unset'}
            onValueChange={(next) => onChange('cpu_brand', next === 'unset' ? '' : next)}
          >
            <SelectTrigger id="pc-cpu-brand" aria-label="Processor brand">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set</SelectItem>
              {CPU_BRAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pc-cpu-model">Processor model</Label>
          <Input
            id="pc-cpu-model"
            list="pc-cpu-models"
            value={value.cpu_model}
            onChange={(event) => onChange('cpu_model', event.target.value)}
            placeholder={models[0] ? `e.g. ${models[0]}` : 'Type the exact model'}
            maxLength={60}
          />
          <datalist id="pc-cpu-models">
            {models.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
          <p className="text-[11px] text-muted-foreground">
            Pick a suggestion or type a model that is not listed.
          </p>
        </div>
      </div>
    </fieldset>
  );
}