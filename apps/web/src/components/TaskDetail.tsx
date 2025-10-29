import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, isOverdue, getPriorityColor, getStatusColor } from "@/lib/utils"
import { Calendar, Clock, Trash2, Edit } from "lucide-react"
import TaskForm from "./TaskForm"

interface TaskDetailProps {
  taskId: Id<"tasks">
  onClose: () => void
  onDelete: (taskId: Id<"tasks">) => void
}

export default function TaskDetail({ taskId, onClose, onDelete }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const task = useQuery(api.endpoints.tasks.get, { id: taskId })

  if (!task) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading task...</div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          taskId={taskId}
          initialData={{
            title: task.title,
            description: task.description,
            status: task.status,
            dueDate: task.dueDate,
            priority: task.priority
          }}
          onSuccess={() => {
            setIsEditing(false)
            onClose()
          }}
        />
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <div className="flex gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => {
                onDelete(taskId)
                onClose()
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority} Priority
          </Badge>
        </div>

        {task.description && (
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {task.dueDate && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </h4>
              <p className={isOverdue(task.dueDate) ? "text-red-600 font-medium" : ""}>
                {formatDate(task.dueDate)}
                {isOverdue(task.dueDate) && " (Overdue)"}
              </p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Created
            </h4>
            <p className="text-muted-foreground">
              {formatDate(task._creationTime)}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  )
}
