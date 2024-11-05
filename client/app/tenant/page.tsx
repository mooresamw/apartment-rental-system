'use client'
import {useEffect, useState} from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Settings, PlusCircle, Upload } from 'lucide-react'
import maintenanceRequest from "@/app/MaintenanceRequest";

const myApt: string = '10'
export default function TenantDashboard() {

  // State objects
  const [requests, setRequests] = useState<maintenanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    area: '',
    description: '',
    photo: null
  })
  const [errors, setErrors] = useState({
    area: '',
    description: '',
  })

  // Hook to fetch the request by the apartment number on initial page load
  useEffect(() => {
    fetch(`http://127.0.0.1:8080/api/requests_by_apt/${myApt}`)
      .then((response) => response.json())
      .then((data) => {
        setRequests(data);
        setIsLoading(false)
      });
  }, []);

  // Method to handle input changes in the form
  const handleInputChange = (e: { target: any }) => {
    const { name, value } = e.target
    setNewRequest(prev => ({ ...prev, [name]: value }))

    // Real-time form validation
    setErrors((prevErrors) => {
      let error = '';
      if (name === 'area' && value === '') {
        error = 'Area is required';
      } else if (name === 'description' && value.trim() === '') {
        error = 'Description is required';
      }
      return { ...prevErrors, [name]: error };
    });
  }

  // Method to handle the file upload
  const handleFileChange = (e: { target: { files: any[] } }) => {
    const file = e.target.files[0]
    if (file) {
      setNewRequest(prev => ({ ...prev, photo: file }))
    }
  }


  // Method to handle form submission for a new request
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    // Check if there are any validation errors
    const newErrors = {
      area: newRequest.area ? '' : 'Area is required',
      description: newRequest.description.trim() ? '' : 'Description is required',
    };
    setErrors(newErrors);

    // Prevent form submission if there are errors
    if (Object.values(newErrors).some((error) => error)) {
      console.log("Form validation failed");
      return;
    }

    // data for maintenanceRequest object to submit
    const newRequestData = {
      id: `REQ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      apartmentNumber: myApt, // Assuming the tenant's apartment number
      area: newRequest.area,
      description: newRequest.description,
      dateTime: new Date().toISOString(),
      photo: newRequest.photo ? URL.createObjectURL(newRequest.photo) : undefined,
      status: 'pending',
      urgency: 'medium', // in the future i will have the system automatically apply an urgency
      comment: null
    }

    // Send post request containing new maintenanceRequest to the backend
    try {
      const res = await fetch('http://localhost:8080/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //mode: 'no-cors',
        body: JSON.stringify(newRequestData),
      });

      const result = await res.json();
      console.log(result)

      // Update the page when the request is submitted
      setRequests((prevRequests) => [newRequestData, ...prevRequests]);
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }

    console.log('New request submitted:', newRequestData)
    setIsDialogOpen(false)
    setNewRequest({ area: '', description: '', photo: null }) // Reset the state object
  }

  // Method to get the color an urgency badge
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // If the page is still loading, then display a loading page
  if(isLoading) {
    return (
        <div>Loading...</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Tenant!</h1>
          <Button variant="ghost" className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Profile Settings</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-end mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Submit New Request</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit New Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="area">Area</Label>
                    <Select name="area" value={newRequest.area} onValueChange={(value) => handleInputChange({ target: { name: 'area', value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kitchen">Kitchen</SelectItem>
                        <SelectItem value="Bathroom">Bathroom</SelectItem>
                        <SelectItem value="Living Room">Living Room</SelectItem>
                        <SelectItem value="Bedroom">Bedroom</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.area && <span className="text-xs text-red-500">{errors.area}</span>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newRequest.description}
                      onChange={handleInputChange}
                      placeholder="Describe the issue..."
                    />
                    {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                  </div>
                  <div>
                    <Label htmlFor="photo">Photo (Optional)</Label>
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <Button type="submit">Submit Request</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ongoing Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.filter(request => request.status === 'pending').map(request => (
                  <div key={request.id} className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
                    <div>
                      <h3 className="font-semibold">{request.area} - {request.apartmentNumber}</h3>
                      <p className="text-sm text-gray-500">{request.description}</p>
                      <p className="text-xs text-gray-400">{new Date(request.dateTime).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.photo && (
                        <img src={request.photo} alt="MaintenanceRequest" className="w-10 h-10 object-cover rounded" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.filter(request => request.status === 'completed').map(request => (
                  <div key={request.id} className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
                    <div>
                      <h3 className="font-semibold">{request.area} - {request.apartmentNumber}</h3>
                      <p className="text-sm text-gray-500">{request.description}</p>
                      <p className="text-xs text-gray-400">{new Date(request.dateTime).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.photo && (
                        <img src={request.photo} alt="MaintenanceRequest" className="w-10 h-10 object-cover rounded" />
                      )}
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Leave Feedback</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}