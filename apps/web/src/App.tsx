import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, LayoutGrid, Table as TableIcon, List } from "lucide-react"
import TaskForm from "./components/TaskForm"
import TaskTable from "./components/TaskTable"
import TaskKanban from "./components/TaskKanban"
import TaskDetail from "./components/TaskDetail"
import "./globals.css"

export default function App() {
  const [view, setView] = useState<"table" | "kanban">("kanban")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const tasks = useQuery(api.endpoints.tasks.list)
  const deleteTask = useMutation(api.endpoints.tasks.remove)

  const handleTaskClick = (taskId: Id<"tasks">) => {
    setSelectedTaskId(taskId)
    setIsDetailOpen(true)
  }

  const handleDelete = async (taskId: Id<"tasks">) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask({ id: taskId })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Task Manager</h1>

          <div className="flex items-center gap-3">
            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "kanban")}>
              <TabsList>
                <TabsTrigger value="kanban">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="table">
                  <TableIcon className="w-4 h-4 mr-2" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <TaskForm onSuccess={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!tasks ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <>
            {view === "table" && (
              <TaskTable
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onDelete={handleDelete}
              />
            )}
            {view === "kanban" && (
              <TaskKanban
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            {selectedTaskId && (
              <TaskDetail
                taskId={selectedTaskId}
                onClose={() => setIsDetailOpen(false)}
                onDelete={handleDelete}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
