import HeptabaseLikeCanvasPlugin from "src/main"
import { HeptabaseLikeCanvasPluginSettingsValues } from "src/settings"

export default abstract class CanvasExtension {
  plugin: HeptabaseLikeCanvasPlugin

  abstract isEnabled(): boolean | keyof HeptabaseLikeCanvasPluginSettingsValues
  abstract init(): void

  constructor(plugin: HeptabaseLikeCanvasPlugin) {
    this.plugin = plugin

    const isEnabled = this.isEnabled()
    
    if (!(isEnabled === true || this.plugin.settings.getSetting(isEnabled as any))) return

    this.init()
  }
}