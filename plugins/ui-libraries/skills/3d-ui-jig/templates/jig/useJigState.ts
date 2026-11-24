import { useCallback, useMemo, useState } from "react";
import { DEFAULT_RIG } from "@/three/rig/rigTypes";
import type { SceneModule } from "@/three/scenes/types";
import { deepMerge, getPath, setPath, type DeepPartial, type JigValues } from "./schema";

export const DEFAULT_PRESET = "Default";

/** `?nojig=1` hides all jig chrome for clean 1:1 captures. */
export function isNoJig(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("nojig") === "1" || q.get("nojig") === "true";
}

export function buildDefaults<P>(module: SceneModule<P>): JigValues<P> {
  return {
    rig: deepMerge(DEFAULT_RIG, module.rigDefaults),
    scene: structuredClone(module.defaults),
  };
}

export function buildPresets<P>(module: SceneModule<P>): Record<string, JigValues<P>> {
  const base = buildDefaults(module);
  const out: Record<string, JigValues<P>> = { [module.defaultPresetName ?? DEFAULT_PRESET]: base };
  for (const [name, patch] of Object.entries(module.presets ?? {})) {
    out[name] = deepMerge(base, patch as DeepPartial<JigValues<P>>);
  }
  return out;
}

/**
 * All jig state in one hook: live values, presets, reset, and a reset signal
 * the stage listens to. Paths listed in `module.persistPaths` (e.g. card
 * content) survive preset switches and Reset.
 */
export function useJigState<P>(module: SceneModule<P>) {
  const presets = useMemo(() => buildPresets(module), [module]);
  const presetNames = useMemo(() => Object.keys(presets), [presets]);
  const defaultName = module.defaultPresetName ?? DEFAULT_PRESET;
  const [presetName, setPresetName] = useState(defaultName);
  const [values, setValues] = useState<JigValues<P>>(() => structuredClone(presets[defaultName]));
  const [resetSignal, setResetSignal] = useState(0);
  const [noJig] = useState(isNoJig);

  const keepPersisted = useCallback(
    (next: JigValues<P>, prev: JigValues<P>) =>
      (module.persistPaths ?? []).reduce(
        (acc, path) => setPath(acc, path, structuredClone(getPath(prev, path))),
        next,
      ),
    [module],
  );

  const setValue = useCallback((path: string, value: unknown) => {
    setValues((prev) => setPath(prev, path, value));
  }, []);

  const setScene = useCallback((updater: (prev: P) => P) => {
    setValues((prev) => ({ ...prev, scene: updater(prev.scene) }));
  }, []);

  const applyPreset = useCallback(
    (name: string) => {
      const p = presets[name];
      if (!p) return;
      setPresetName(name);
      setValues((prev) => keepPersisted(structuredClone(p), prev));
    },
    [presets, keepPersisted],
  );

  const cyclePreset = useCallback(() => {
    const i = presetNames.indexOf(presetName);
    applyPreset(presetNames[(i + 1) % presetNames.length]);
  }, [applyPreset, presetName, presetNames]);

  const reset = useCallback(() => {
    setPresetName(defaultName);
    setValues((prev) => keepPersisted(structuredClone(presets[defaultName]), prev));
    setResetSignal((n) => n + 1);
  }, [defaultName, presets, keepPersisted]);

  const resetView = useCallback(() => {
    setValues((prev) => ({ ...prev, rig: { ...prev.rig, camera: structuredClone(presets[presetName].rig.camera) } }));
    setResetSignal((n) => n + 1);
  }, [presetName, presets]);

  return {
    values,
    setValues,
    setValue,
    setScene,
    presetName,
    presetNames,
    applyPreset,
    cyclePreset,
    reset,
    resetView,
    resetSignal,
    noJig,
  };
}
