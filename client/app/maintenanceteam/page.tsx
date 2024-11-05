'use client'

import {useCallback, useEffect, useState} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import maintenanceRequest from "@/app/MaintenanceRequest";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import Image from "next/image";

export default function MaintenanceDashboard() {
  const [tasks, setTasks] = useState<maintenanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [apartmentFilter, setApartmentFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [comments, setComments] = useState<Record<string, string>>({});
  const [comment, setComment] = useState<Record<string, string>>({});

  // Hook to fetch the maintenance requests
  useEffect(() => {
    fetch("http://localhost:8080/api/requests")
        .then((response) => response.json())
        .then((data) => {
          setTasks(data);
          setIsLoading(false)
        });
  }, []);

  // method to filter the tasks by status, apartment number, area, and date range
  const filteredTasks = tasks.filter(task =>
    (statusFilter === 'all' || task.status === statusFilter) &&
    (apartmentFilter === '' || task.apartmentNumber.includes(apartmentFilter)) &&
    (areaFilter === 'all' || task.area === areaFilter) &&
    (!dateRange.from || !dateRange.to || (new Date(task.dateTime) >= dateRange.from && new Date(task.dateTime) <= dateRange.to)))
        .sort((a, b) => {
    const urgencyOrder = { urgent: 0, moderate: 1, low: 2 }
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  })

  const pendingTasksCount = tasks.filter(task => task.status === 'pending').length

  const handleDateChange = useCallback((range: { from: Date | null; to: Date | null }) => {
    setDateRange(range)
  }, [])


  // method to mark a request as complete
  const handleMarkAsDone = async (taskId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/update_request/${taskId}`, {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({status: 'completed'})
      })
      const result = await res.json();
      console.log(result)
      setTasks(tasks.map(task =>
      task.id === taskId && task.status === 'pending' ? { ...task, status: 'completed' } : task
    ))
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }

  }

  // Update the temporary comment input for each task as the user types
  const handleCommentInput = (taskId: string, value: string) => {
    setComment(prevInput => ({
      ...prevInput,
      [taskId]: value,
    }));
  };

  // When submitting, save the input to comments and clear the input
  const handleAddComment = async (taskId: string) => {
    setComments(prevComments => ({
        ...prevComments,
        [taskId]: comment[taskId] || "",
    }));
    // Clear the input field for this task
    setComment(prevInput => ({
        ...prevInput,
        [taskId]: "",
    }));
    const data = comment[taskId]
    console.log("data", data)

    // send post request containing comment data to the backend
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/add_comment/${taskId}`, {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({comment: data})
      })
      const result = await res.json();
      console.log(result)
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }
  };

  if(isLoading) {
    return (
        <div>Loading...</div>
    )
  }


  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Maintenance Dashboard</h1>
        <p className="text-xl">Welcome, You have {pendingTasksCount} pending requests.</p>
      </header>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select onValueChange={setStatusFilter} defaultValue="all">
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="apartment-filter">Filter by Apartment Number</Label>
          <Input
            id="apartment-filter"
            placeholder="Enter apartment number"
            value={apartmentFilter}
            onChange={(e) => setApartmentFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="area-filter">Filter by Area</Label>
          <Select onValueChange={setAreaFilter} defaultValue="all">
            <SelectTrigger id="area-filter">
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              <SelectItem value="Kitchen">Kitchen</SelectItem>
              <SelectItem value="Living Room">Living Room</SelectItem>
              <SelectItem value="Bedroom">Bedroom</SelectItem>
              <SelectItem value="Bathroom">Bathroom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <Label>Filter by Date Range</Label>
          <DatePickerWithRange onDateChange={handleDateChange} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className={`
            ${task.urgency === 'urgent' ? 'border-red-500' : 
              task.urgency === 'moderate' ? 'border-yellow-500' : 'border-green-500'}
            ${task.status === 'completed' ? 'opacity-60' : ''}
          `}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{task.description}</span>
                <Badge variant={task.urgency === 'urgent' ? 'destructive' :
                  task.urgency === 'moderate' ? 'warning' : 'success'}>
                  {task.urgency}
                </Badge>
              </CardTitle>
              <CardDescription>Apt {task.apartmentNumber} - {task.area}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Status: {task.status}</p>
              <p>Date: {new Date(task.dateTime).toLocaleString()}</p>
              {task.photo && (
                        <img src={task.photo} alt="MaintenanceRequest" className="w-60 h-60 object-cover rounded" />
              )}
              {comments[task.id] && (<p>Comment: {comments[task.id]} </p>) || (<p>Comment: {task.comment}</p>)}
            </CardContent>
            <CardFooter className="flex justify-between">
              {task.status === 'pending' && (
                <Button onClick={() => handleMarkAsDone(task.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Done
                </Button>
              )}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a comment"
                  value={comment[task.id] || ""}
                  onChange={(e) => handleCommentInput(task.id, e.target.value)}
                />
                <Button variant="outline" onClick={() => handleAddComment(task.id)}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Comment
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}