import { Id } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, isOverdue, getPriorityColor, getStatusColor } from "@/lib/utils"
import { Trash2, Eye } from "lucide-react"

interface Task {
  _id: Id<"tasks">
  title: string
  description?: string
  status: string
  dueDate?: number
  priority: string
  _creationTime: number
}

interface TaskTableProps {
  tasks: Task[]
  onTaskClick: (taskId: Id<"tasks">) => void
  onDelete: (taskId: Id<"tasks">) => void
}

export default function TaskTable({ tasks, onTaskClick, onDelete }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tasks yet. Create your first task to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Title</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Priority</th>
              <th className="text-left px-4 py-3 font-semibold">Due Date</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onTaskClick(task._id)}
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {task.dueDate ? (
                    <span className={isOverdue(task.dueDate) ? "text-red-600 font-medium" : ""}>
                      {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && " (Overdue)"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onTaskClick(task._id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDelete(task._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
