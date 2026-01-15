import { setIcon, setTooltip } from "obsidian"
import { Canvas } from "src/@types/Canvas"
import CanvasHelper from "src/utils/canvas-helper"
import CanvasExtension from "./canvas-extension"

type InputMode = 'mouse' | 'touchpad'

export default class InputModeCanvasExtension extends CanvasExtension {
  isEnabled() { return 'inputModeFeatureEnabled' as const }

  private currentMode: InputMode = 'mouse'
  private wheelHandler: ((e: WheelEvent) => void) | null = null

  init() {
    // Load default mode from settings
    this.currentMode = this.plugin.settings.getSetting('defaultInputMode') || 'mouse'

    // Add control button when canvas changes
    this.plugin.registerEvent(this.plugin.app.workspace.on(
      'advanced-canvas:canvas-changed',
      (canvas: Canvas) => this.addInputModeButton(canvas)
    ))
  }

  private addInputModeButton(canvas: Canvas) {
    const settingsContainer = canvas.quickSettingsButton?.parentElement
    if (!settingsContainer) return

    // Remove previous handler if exists
    if (this.wheelHandler) {
      canvas.wrapperEl.removeEventListener('wheel', this.wheelHandler)
    }

    // Create wheel handler for touchpad mode
    this.wheelHandler = (e: WheelEvent) => {
      if (this.currentMode !== 'touchpad') return
      if (canvas.readonly) return

      // In touchpad mode, wheel scrolls instead of zooms
      e.preventDefault()
      e.stopPropagation()

      // Apply panning
      const scale = Math.pow(2, canvas.tZoom)
      canvas.tx += e.deltaX / scale
      canvas.ty += e.deltaY / scale
      canvas.markViewportChanged()
    }

    canvas.wrapperEl.addEventListener('wheel', this.wheelHandler, { passive: false, capture: true })

    // Create toggle button
    const button = CanvasHelper.createControlMenuButton({
      id: 'input-mode-toggle',
      label: this.currentMode === 'mouse' ? 'Mouse mode (scroll = zoom)' : 'Touchpad mode (scroll = pan)',
      icon: this.currentMode === 'mouse' ? 'mouse' : 'tablet',
      callback: () => this.toggleMode(canvas, button)
    })

    CanvasHelper.addControlMenuButton(settingsContainer, button)
  }

  private toggleMode(canvas: Canvas, button: HTMLElement) {
    // Unused parameter canvas kept for potential future use
    void canvas

    this.currentMode = this.currentMode === 'mouse' ? 'touchpad' : 'mouse'
    
    // Update button appearance
    setIcon(button, this.currentMode === 'mouse' ? 'mouse' : 'tablet')
    setTooltip(button, this.currentMode === 'mouse' ? 'Mouse mode (scroll = zoom)' : 'Touchpad mode (scroll = pan)', { placement: 'left' })

    // Save preference
    this.plugin.settings.setSetting({ defaultInputMode: this.currentMode })
  }
}
