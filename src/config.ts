import path from "path"
import fs from "fs"
import os from "os"

export type Config = {
  dbUrl: string              
  currentUserName?: string   
}

export function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json")
}

export function setUser(username: string): void {
  const cfg = readConfig()
  cfg.currentUserName = username
  writeConfig(cfg)
}


export function readConfig(): Config {
  const filePath = getConfigFilePath()
  const rawText = fs.readFileSync(filePath, "utf-8")
  const rawConfig = JSON.parse(rawText)
  return validateConfig(rawConfig)
}


export function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath()
  fs.writeFileSync(filePath, JSON.stringify({
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName
  }, null, 2), "utf-8")
}

export function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("Invalid config: missing db_url")
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name
  }
}
