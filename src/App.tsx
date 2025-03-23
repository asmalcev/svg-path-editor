import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { SvgPreview } from './components/SvgPreview'
import { CommandList } from './components/CommandList'
import { PathCommand, Point, PathState } from './types/svg'
import './App.css'

function App() {
  const [pathState, setPathState] = useState<PathState>({
    commands: [
      {
        type: 'M',
        points: [{ x: 100, y: 100 }],
      },
      {
        type: 'L',
        points: [{ x: 200, y: 200 }],
      },
    ],
    selectedCommandIndex: null,
    selectedPointIndex: null,
  })

  const handlePointDrag = (commandIndex: number, pointIndex: number, newPoint: Point) => {
    setPathState((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, idx) =>
        idx === commandIndex
          ? {
              ...cmd,
              points: cmd.points.map((p, pidx) =>
                pidx === pointIndex ? newPoint : p
              ),
            }
          : cmd
      ),
    }))
  }

  const handleSelect = (commandIndex: number | null, pointIndex: number | null) => {
    setPathState((prev) => ({
      ...prev,
      selectedCommandIndex: commandIndex,
      selectedPointIndex: pointIndex,
    }))
  }

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    setPathState((prev) => {
      const newCommands = [...prev.commands]
      const [draggedCommand] = newCommands.splice(dragIndex, 1)
      newCommands.splice(hoverIndex, 0, draggedCommand)
      return {
        ...prev,
        commands: newCommands,
      }
    })
  }

  const handleAddCommand = (type: PathCommand['type']) => {
    const defaultPoints: Point[] = []
    switch (type) {
      case 'M':
      case 'L':
        defaultPoints.push({ x: 100, y: 100 })
        break
      case 'H':
      case 'V':
        defaultPoints.push({ x: 100, y: 0 })
        break
      case 'C':
        defaultPoints.push(
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 }
        )
        break
      case 'S':
        defaultPoints.push({ x: 200, y: 100 }, { x: 200, y: 200 })
        break
      case 'Q':
        defaultPoints.push({ x: 150, y: 150 }, { x: 200, y: 200 })
        break
      case 'T':
        defaultPoints.push({ x: 200, y: 200 })
        break
      case 'A':
        defaultPoints.push(
          { x: 50, y: 50 },
          { x: 0, y: 0 },
          { x: 200, y: 200 }
        )
        break
      case 'Z':
        break
    }

    setPathState((prev) => ({
      ...prev,
      commands: [
        ...prev.commands,
        {
          type,
          points: defaultPoints,
        },
      ],
    }))
  }

  const handleDeleteCommand = (index: number) => {
    setPathState((prev) => ({
      ...prev,
      commands: prev.commands.filter((_, i) => i !== index),
      selectedCommandIndex:
        prev.selectedCommandIndex === index ? null : prev.selectedCommandIndex,
      selectedPointIndex: null,
    }))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <div className="editor-container">
          <div className="preview-section">
            <SvgPreview
              commands={pathState.commands}
              onPointDrag={handlePointDrag}
              selectedCommandIndex={pathState.selectedCommandIndex}
              selectedPointIndex={pathState.selectedPointIndex}
              onSelect={handleSelect}
            />
          </div>
          <div className="commands-section">
            <CommandList
              commands={pathState.commands}
              selectedCommandIndex={pathState.selectedCommandIndex}
              selectedPointIndex={pathState.selectedPointIndex}
              onSelect={handleSelect}
              onReorder={handleReorder}
              onAddCommand={handleAddCommand}
              onDeleteCommand={handleDeleteCommand}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default App
