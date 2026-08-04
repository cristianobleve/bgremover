/**
 * History Manager for Canvas Mask State (Undo / Redo)
 * Manages HD mask snapshots with maximum stack memory safety.
 */
export class HistoryManager {
  constructor(maxSize = 25) {
    this.maxSize = maxSize;
    this.undoStack = [];
    this.redoStack = [];
  }

  pushState(maskCanvas) {
    // Clone current mask canvas state as an ImageBitmap or offscreen canvas
    const snapshot = document.createElement('canvas');
    snapshot.width = maskCanvas.width;
    snapshot.height = maskCanvas.height;
    const ctx = snapshot.getContext('2d');
    ctx.drawImage(maskCanvas, 0, 0);

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 1; // Keep current state
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo(currentMaskCanvas) {
    if (!this.canUndo()) return null;
    
    // Save current state to redo stack
    const currentSnapshot = document.createElement('canvas');
    currentSnapshot.width = currentMaskCanvas.width;
    currentSnapshot.height = currentMaskCanvas.height;
    currentSnapshot.getContext('2d').drawImage(currentMaskCanvas, 0, 0);
    this.redoStack.push(currentSnapshot);

    // Pop the previous state
    this.undoStack.pop(); // remove current state
    const previousSnapshot = this.undoStack[this.undoStack.length - 1];

    // Restore previous state into current mask canvas
    const ctx = currentMaskCanvas.getContext('2d');
    ctx.clearRect(0, 0, currentMaskCanvas.width, currentMaskCanvas.height);
    ctx.drawImage(previousSnapshot, 0, 0);

    return previousSnapshot;
  }

  redo(currentMaskCanvas) {
    if (!this.canRedo()) return null;

    const nextSnapshot = this.redoStack.pop();
    
    // Push back to undo stack
    this.undoStack.push(nextSnapshot);

    // Restore next state into current mask canvas
    const ctx = currentMaskCanvas.getContext('2d');
    ctx.clearRect(0, 0, currentMaskCanvas.width, currentMaskCanvas.height);
    ctx.drawImage(nextSnapshot, 0, 0);

    return nextSnapshot;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
