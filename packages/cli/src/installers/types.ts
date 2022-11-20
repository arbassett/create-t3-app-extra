export type Packages = readonly string[];

export type InstallerMap<T extends Packages> = {
  [pkg in T[number]]: {
    inUse: boolean;
    // installer: Installer;
  };
};
