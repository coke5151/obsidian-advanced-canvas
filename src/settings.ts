import { PluginSettingTab, Setting as SettingEl } from "obsidian"
import HeptabaseLikeCanvasPlugin from "./main"

export interface HeptabaseLikeCanvasPluginSettingsValues {
  // Input Mode
  inputModeFeatureEnabled: boolean
  defaultInputMode: 'mouse' | 'touchpad'

  // Drag to File
  dragToFileFeatureEnabled: boolean
  autoConvertDraggedTextToFile: boolean

  // Delete File
  deleteFileFromContextMenuEnabled: boolean
}

export const DEFAULT_SETTINGS_VALUES: HeptabaseLikeCanvasPluginSettingsValues = {
  inputModeFeatureEnabled: true,
  defaultInputMode: 'mouse',

  dragToFileFeatureEnabled: true,
  autoConvertDraggedTextToFile: false,

  deleteFileFromContextMenuEnabled: true,
}

export default class SettingsManager {
  private plugin: HeptabaseLikeCanvasPlugin
  private settings: HeptabaseLikeCanvasPluginSettingsValues

  constructor(plugin: HeptabaseLikeCanvasPlugin) {
    this.plugin = plugin
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS_VALUES, await this.plugin.loadData())
  }

  async saveSettings() {
    await this.plugin.saveData(this.settings)
  }

  getSetting<T extends keyof HeptabaseLikeCanvasPluginSettingsValues>(key: T): HeptabaseLikeCanvasPluginSettingsValues[T] {
    return this.settings[key]
  }

  async setSetting(data: Partial<HeptabaseLikeCanvasPluginSettingsValues>) {
    this.settings = Object.assign(this.settings, data)
    await this.saveSettings()
  }

  addSettingsTab() {
    this.plugin.addSettingTab(new HeptabaseLikeCanvasPluginSettingTab(this.plugin, this))
  }
}

class HeptabaseLikeCanvasPluginSettingTab extends PluginSettingTab {
  settingsManager: SettingsManager

  constructor(plugin: HeptabaseLikeCanvasPlugin, settingsManager: SettingsManager) {
    super(plugin.app, plugin)
    this.settingsManager = settingsManager
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl('h2', { text: 'Heptabase-like Canvas Settings' })

    // Input Mode Toggle
    new SettingEl(containerEl)
      .setName('Enable input mode toggle')
      .setDesc('Show a button to switch between Mouse mode (scroll = zoom) and Touchpad mode (scroll = pan).')
      .addToggle(toggle => toggle
        .setValue(this.settingsManager.getSetting('inputModeFeatureEnabled'))
        .onChange(async (value) => {
          await this.settingsManager.setSetting({ inputModeFeatureEnabled: value })
        })
      )

    new SettingEl(containerEl)
      .setName('Default input mode')
      .setDesc('The default input mode when opening a canvas.')
      .addDropdown(dropdown => dropdown
        .addOption('mouse', 'Mouse (scroll = zoom)')
        .addOption('touchpad', 'Touchpad (scroll = pan)')
        .setValue(this.settingsManager.getSetting('defaultInputMode'))
        .onChange(async (value: 'mouse' | 'touchpad') => {
          await this.settingsManager.setSetting({ defaultInputMode: value })
        })
      )

    // Drag to File
    new SettingEl(containerEl)
      .setName('Enable drag text to file')
      .setDesc('Add "Convert to file" option in text node context menu.')
      .addToggle(toggle => toggle
        .setValue(this.settingsManager.getSetting('dragToFileFeatureEnabled'))
        .onChange(async (value) => {
          await this.settingsManager.setSetting({ dragToFileFeatureEnabled: value })
        })
      )

    new SettingEl(containerEl)
      .setName('Auto-convert dragged text to file')
      .setDesc('When enabled, text dragged from a file node will automatically prompt to create a new file.')
      .addToggle(toggle => toggle
        .setValue(this.settingsManager.getSetting('autoConvertDraggedTextToFile'))
        .onChange(async (value) => {
          await this.settingsManager.setSetting({ autoConvertDraggedTextToFile: value })
        })
      )

    // Delete File
    new SettingEl(containerEl)
      .setName('Enable delete file from context menu')
      .setDesc('Add "Delete file" option to file node context menu to permanently delete the file.')
      .addToggle(toggle => toggle
        .setValue(this.settingsManager.getSetting('deleteFileFromContextMenuEnabled'))
        .onChange(async (value) => {
          await this.settingsManager.setSetting({ deleteFileFromContextMenuEnabled: value })
        })
      )
  }
}
