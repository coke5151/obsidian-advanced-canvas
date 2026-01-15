import { Menu } from "obsidian"
import { Canvas, CanvasNode } from "src/@types/Canvas"
import { CanvasTextNodeData } from "src/@types/AdvancedJsonCanvas"
import { FileNameModal } from "src/utils/modal-helper"
import CanvasExtension from "./canvas-extension"

export default class DragToFileCanvasExtension extends CanvasExtension {
  isEnabled() { return 'dragToFileFeatureEnabled' as const }

  init() {
    // Listen for newly created text nodes and offer to convert to file
    this.plugin.registerEvent(this.plugin.app.workspace.on(
      'advanced-canvas:node-created' as any,
      (canvas: Canvas, node: CanvasNode) => this.onNodeCreated(canvas, node)
    ))

    // Add "Convert to file" option in context menu for text nodes
    this.plugin.registerEvent(this.plugin.app.workspace.on(
      'canvas:node-menu',
      (menu: Menu, node: CanvasNode) => this.addConvertToFileOption(menu, node)
    ))
  }

  private onNodeCreated(canvas: Canvas, node: CanvasNode) {
    const nodeData = node.getData() as CanvasTextNodeData
    
    // Only handle text nodes with content (likely dragged from file node)
    if (nodeData.type !== 'text') return
    if (!this.plugin.settings.getSetting('autoConvertDraggedTextToFile')) return
    
    const textContent = nodeData.text
    if (!textContent || textContent.trim().length === 0) return

    // Auto-convert to file if setting is enabled
    this.convertTextNodeToFile(canvas, node, textContent)
  }

  private addConvertToFileOption(menu: Menu, node: CanvasNode) {
    const nodeData = node.getData() as CanvasTextNodeData
    if (nodeData.type !== 'text') return

    const textContent = nodeData.text
    if (!textContent) return

    menu.addItem((item) =>
      item
        .setTitle('Convert to file')
        .setIcon('file-plus')
        .onClick(() => this.convertTextNodeToFile(node.canvas, node, textContent))
    )
  }

  private async convertTextNodeToFile(canvas: Canvas, node: CanvasNode, textContent: string) {
    const nodeData = node.getData()

    // Get target folder path
    const canvasSettings = (this.plugin.app as any).internalPlugins.plugins.canvas.instance.options
    const defaultNewFileLocation = canvasSettings.newFileLocation
    let targetFolderPath = this.plugin.app.vault.getRoot().path
    if (defaultNewFileLocation === 'current') {
      targetFolderPath = canvas.view.file?.parent?.path ?? targetFolderPath
    } else if (defaultNewFileLocation === 'folder') {
      targetFolderPath = canvasSettings.newFileFolderPath ?? targetFolderPath
    }

    // Prompt for filename
    const targetFilePath = await new FileNameModal(
      this.plugin.app,
      targetFolderPath,
      'md'
    ).awaitInput()

    if (!targetFilePath) return

    // Create the new file with the text content
    const file = await this.plugin.app.vault.create(targetFilePath, textContent)

    // Remove the original text node
    canvas.removeNode(node)

    // Create a file node at the same position
    canvas.createFileNode({
      pos: { x: nodeData.x, y: nodeData.y },
      size: { width: nodeData.width, height: nodeData.height },
      file: file
    })
  }
}
