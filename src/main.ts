import { ItemView, Plugin } from 'obsidian'
import { Canvas, CanvasView } from './@types/Canvas'

// Managers
import SettingsManager from './settings'

// Patchers
import Patcher from './patchers/patcher'
import CanvasPatcher from './patchers/canvas-patcher'

// Canvas Extensions
import CanvasExtension from './canvas-extensions/canvas-extension'
import InputModeCanvasExtension from './canvas-extensions/input-mode-canvas-extension'
import DragToFileCanvasExtension from './canvas-extensions/drag-to-file-canvas-extension'
import DeleteFileCanvasExtension from './canvas-extensions/delete-file-canvas-extension'

const PATCHERS = [
  CanvasPatcher,
]

const CANVAS_EXTENSIONS: typeof CanvasExtension[] = [
  InputModeCanvasExtension,
  DragToFileCanvasExtension,
  DeleteFileCanvasExtension,
]

export default class HeptabaseLikeCanvasPlugin extends Plugin {
  settings: SettingsManager
  patchers: Patcher[]
  canvasExtensions: CanvasExtension[]

  async onload() {
    this.settings = new SettingsManager(this)
    await this.settings.loadSettings()
    this.settings.addSettingsTab()

    this.patchers = PATCHERS.map((Patcher: any) => {
      try { return new Patcher(this) }
      catch (e) {
        console.error(`Error initializing patcher ${Patcher.name}:`, e)
      }
    })

    this.canvasExtensions = CANVAS_EXTENSIONS.map((Extension: any) => {
      try { return new Extension(this) }
      catch (e) {
        console.error(`Error initializing extension ${Extension.name}:`, e)
      }
    })
  }

  onunload() {}

  getCurrentCanvasView(): CanvasView | null {
    const canvasView = this.app.workspace.getActiveViewOfType(ItemView)
    if (canvasView?.getViewType() !== 'canvas') return null
    return canvasView as CanvasView
  }

  getCurrentCanvas(): Canvas | null {
    return this.getCurrentCanvasView()?.canvas || null
  }
}
