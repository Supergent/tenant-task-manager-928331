import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, isOverdue, getPriorityColor } from "@/lib/utils"
import { Trash2, Calendar, AlertCircle } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useState } from "react"

interface Task {
  _id: Id<"tasks">
  title: string
  description?: string
  status: string
  dueDate?: number
  priority: string
  _creationTime: number
}

interface TaskKanbanProps {
  tasks: Task[]
  onTaskClick: (taskId: Id<"tasks">) => void
  onDelete: (taskId: Id<"tasks">) => void
}

const COLUMNS = ["To Do", "In Progress", "Done"]

export default function TaskKanban({ tasks, onTaskClick, onDelete }: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null)
  const updateTask = useMutation(api.endpoints.tasks.update)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"tasks">)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as Id<"tasks">
    const newStatus = over.id as string

    const task = tasks.find(t => t._id === taskId)
    if (task && task.status !== newStatus) {
      await updateTask({
        id: taskId,
        title: task.title,
        description: task.description,
        status: newStatus,
        dueDate: task.dueDate,
        priority: task.priority
      })
    }
  }

  const activeTask = tasks.find(t => t._id === activeId)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(t => t.status === status)}
            onTaskClick={onTaskClick}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-50">
            <TaskCard task={activeTask} onTaskClick={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnProps {
  status: string
  tasks: Task[]
  onTaskClick: (taskId: Id<"tasks">) => void
  onDelete: (taskId: Id<"tasks">) => void
}

function KanbanColumn({ status, tasks, onTaskClick, onDelete }: KanbanColumnProps) {
  const { setNodeRef } = { setNodeRef: (node: HTMLElement | null) => {} }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{status}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 min-h-[400px] p-3 rounded-lg border-2 border-dashed bg-muted/20"
        data-status={status}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onTaskClick={onTaskClick}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  onTaskClick: (taskId: Id<"tasks">) => void
  onDelete: (taskId: Id<"tasks">) => void
}

function TaskCard({ task, onTaskClick, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = {
    attributes: {},
    listeners: {},
    setNodeRef: (node: HTMLElement | null) => {},
    isDragging: false
  }

  return (
    <Card
      ref={setNodeRef}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => onTaskClick(task._id)}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task._id)
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      {(task.description || task.dueDate || task.priority) && (
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>

            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue(task.dueDate) ? "text-red-600 font-medium" : "text-muted-foreground"
              }`}>
                {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
