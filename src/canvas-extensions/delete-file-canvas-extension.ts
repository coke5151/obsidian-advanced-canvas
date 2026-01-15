import { Menu, TFile } from "obsidian"
import { Canvas, CanvasNode } from "src/@types/Canvas"
import { CanvasFileNodeData } from "src/@types/AdvancedJsonCanvas"
import CanvasExtension from "./canvas-extension"

export default class DeleteFileCanvasExtension extends CanvasExtension {
  isEnabled() { return 'deleteFileFromContextMenuEnabled' as const }

  init() {
    // Add "Delete file" option in context menu for file nodes
    this.plugin.registerEvent(this.plugin.app.workspace.on(
      'canvas:node-menu',
      (menu: Menu, node: CanvasNode) => this.addDeleteFileOption(menu, node)
    ))
  }

  private addDeleteFileOption(menu: Menu, node: CanvasNode) {
    const nodeData = node.getData() as CanvasFileNodeData
    if (nodeData.type !== 'file') return
    if (!nodeData.file) return

    const file = this.plugin.app.vault.getAbstractFileByPath(nodeData.file)
    if (!(file instanceof TFile)) return

    menu.addSeparator()
    menu.addItem((item) =>
      item
        .setTitle('Delete file')
        .setIcon('trash-2')
        .onClick(() => this.confirmAndDeleteFile(node.canvas, node, file))
    )
  }

  private async confirmAndDeleteFile(canvas: Canvas, node: CanvasNode, file: TFile) {
    // Create confirmation modal
    const confirmed = await this.showConfirmationDialog(file.name)
    if (!confirmed) return

    // Remove node from canvas first
    canvas.removeNode(node)

    // Move file to trash
    await this.plugin.app.vault.trash(file, true)
  }

  private showConfirmationDialog(fileName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.classList.add('modal-container', 'mod-confirmation')
      
      const modalBg = document.createElement('div')
      modalBg.classList.add('modal-bg')
      modalBg.style.opacity = '0.85'
      modalBg.addEventListener('click', () => {
        document.body.removeChild(modal)
        resolve(false)
      })
      modal.appendChild(modalBg)

      const modalContent = document.createElement('div')
      modalContent.classList.add('modal')
      modalContent.style.width = '400px'
      
      const modalTitle = document.createElement('div')
      modalTitle.classList.add('modal-title')
      modalTitle.textContent = 'Delete file'
      modalContent.appendChild(modalTitle)

      const modalBody = document.createElement('div')
      modalBody.classList.add('modal-content')
      modalBody.innerHTML = `<p>Are you sure you want to delete <strong>${fileName}</strong>?</p><p>This will move the file to trash.</p>`
      modalContent.appendChild(modalBody)

      const modalButtons = document.createElement('div')
      modalButtons.classList.add('modal-button-container')
      
      const cancelBtn = document.createElement('button')
      cancelBtn.classList.add('mod-cta')
      cancelBtn.textContent = 'Cancel'
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal)
        resolve(false)
      })
      modalButtons.appendChild(cancelBtn)

      const deleteBtn = document.createElement('button')
      deleteBtn.classList.add('mod-warning')
      deleteBtn.textContent = 'Delete'
      deleteBtn.addEventListener('click', () => {
        document.body.removeChild(modal)
        resolve(true)
      })
      modalButtons.appendChild(deleteBtn)

      modalContent.appendChild(modalButtons)
      modal.appendChild(modalContent)

      document.body.appendChild(modal)
    })
  }
}
