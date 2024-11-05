"use client"

import {useEffect, useState} from "react"
import { Bell, Users, Wrench, Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


// type object for tenant
type Tenant = {
  tenant_id: string
  name: string
  phone: string
  email: string
  checkin: string
  checkout: string
  apartmentnumber: string
}

export default function ManagerDashboard() {
  // State objects
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tenant")
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [newTenant, setNewTenant] = useState<Tenant>({
    tenant_id: "",
    name: "",
    phone: "",
    email: "",
    checkin: "",
    checkout: "",
    apartmentnumber: ""
  })
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    checkin: "",
    checkout: "",
    apartmentnumber: ""
  })
  const [isAddingTenant, setIsAddingTenant] = useState(false)
  const [isEditingTenant, setIsEditingTenant] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant>({
    tenant_id: "",
    name: "",
    phone: "",
    email: "",
    checkin: "",
    checkout: "",
    apartmentnumber: ""
  })


  // Hook to fetch the tenants when the page loads
  useEffect(() => {
    fetch('http://localhost:8080/api/tenants/')
        .then((res) => res.json())
        .then((data) => {
          setTenants(data)
          setIsLoading(false)
        })
  }, [])

  // Method to handle adding a new tenant
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    // Check if there are any validation errors
    const newErrors = {
      name: newTenant.name ? '' : 'Name is required',
      phone: newTenant.phone.trim() ? '' : 'Phone number is required',
      email: newTenant.email.trim() ? '' : 'Email is required',
      checkin: newTenant.checkin.trim() ? '' : 'Check in date is required',
      checkout: newTenant.checkout.trim() ? '' : 'Check out date is required',
      apartmentnumber: newTenant.apartmentnumber.trim() ? '' : 'Apartment number is required',
    };
    setErrors(newErrors);

    // Prevent form submission if there are errors
    if (Object.values(newErrors).some((error) => error)) {
      console.log("Form validation failed");
      return;
    }

    // new Tenant object to submit
    const newTenantData = {
      tenant_id: `${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
      name: newTenant.name,
      phone: newTenant.phone,
      email: newTenant.email,
      checkin: newTenant.checkin,
      checkout: newTenant.checkout,
      apartmentnumber: newTenant.apartmentnumber
    }

    // send post request containing the Tenant object to the backend
    try {
      const res = await fetch('http://localhost:8080/api/add_tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //mode: 'no-cors',
        body: JSON.stringify(newTenantData),
      });

      const result = await res.json();
      console.log(result)
      setTenants((prevTenants) => [newTenantData, ...prevTenants]);
      console.log('New Tenant submitted:', newTenantData)
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }
    setIsAddingTenant(false)
    setNewTenant({
      tenant_id: "",
      name: "",
      phone: "",
      email: "",
      checkin: "",
      checkout: "",
      apartmentnumber: ""
    })
  }

  // Method to handle changing a tenant's apartment number
  const handleMoveTenant = async (id: string) => {
    // send post request to backend to update the db
    try {
      const res = await fetch(`http://localhost:8080/api/update_tenant_apt/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //mode: 'no-cors',
        body: JSON.stringify({apartmentnumber: editingTenant.apartmentnumber}),
      });

      const result = await res.json();
      console.log(result)
      setTenants(tenants.map(t =>
          t.tenant_id === id ? { ...t, apartmentnumber: editingTenant.apartmentnumber } : t)
      );
    } catch (e) {
      console.error("Error sending data to Flask:", e)
    }
    setEditingTenant({
        tenant_id: "",
        name: "",
        phone: "",
        email: "",
        checkin: "",
        checkout: "",
        apartmentnumber: ""
    })
    setIsEditingTenant(false)
  }

  // Method to handle deleting a tenant
  const handleDeleteTenant = async (id: string) => {
    // send delete request to backend to also remove from db
    try {
      const res = await fetch(`http://localhost:8080/api/remove_tenant/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
      })
      setTenants(tenants.filter(t => t.tenant_id !== id))
      const response = await res.json();
      console.log(response)
    } catch (e) {
      console.error('Error sending to Flask: ', e)
    }
  }

  //if the page is still loading, return a loading screen
  if(isLoading) {
    return (
        <div>Loading...</div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Active Tasks: </span>
              <span className="text-sm font-medium">Pending Approvals: </span>
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="Manager" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex overflow-auto">
        <div style={{'minWidth': '100%'}} className="container py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="tenant">
                <Users className="mr-2 h-4 w-4" />
                Tenant Management
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                <Wrench className="mr-2 h-4 w-4" />
                Maintenance Team
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tenant" className="flex-1 overflow-auto">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Tenant Management</CardTitle>
                  <CardDescription>Add, move, or delete tenant accounts</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto pb-0">
                  <div className="flex justify-between items-center pt-1 mb-4">
                    <Input placeholder="Search tenants..." className="max-w-sm" />
                    <Dialog open={isAddingTenant} onOpenChange={setIsAddingTenant}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Tenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Tenant</DialogTitle>
                          <DialogDescription>Enter the details of the new tenant.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} className="col-span-3" />
                            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input id="phone" value={newTenant.phone} onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})} className="col-span-3" />
                            {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={newTenant.email} onChange={(e) => setNewTenant({...newTenant, email: e.target.value})} className="col-span-3" />
                            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="checkIn" className="text-right">Check-in Date</Label>
                            <Input id="checkIn" type="date" value={newTenant.checkin} onChange={(e) => setNewTenant({...newTenant, checkin: e.target.value})} className="col-span-3" />
                            {errors.checkin && <span className="text-xs text-red-500">{errors.checkin}</span>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="checkOut" className="text-right">Check-out Date</Label>
                            <Input id="checkOut" type="date" value={newTenant.checkout} onChange={(e) => setNewTenant({...newTenant, checkout: e.target.value})} className="col-span-3" />
                            {errors.checkout && <span className="text-xs text-red-500">{errors.checkout}</span>}
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="apartmentNumber" className="text-right">Apartment Number</Label>
                            <Input id="apartmentNumber" value={newTenant.apartmentnumber} onChange={(e) => setNewTenant({...newTenant, apartmentnumber: e.target.value})} className="col-span-3" />
                            {errors.apartmentnumber && <span className="text-xs text-red-500">{errors.apartmentnumber}</span>}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSubmit}>Add Tenant</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Apartment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenants.map((tenant) => (
                          <TableRow key={tenant.tenant_id}>
                            <TableCell>{tenant.name}</TableCell>
                            <TableCell>{tenant.phone}</TableCell>
                            <TableCell>{tenant.email}</TableCell>
                            <TableCell>{tenant.checkin}</TableCell>
                            <TableCell>{tenant.checkout}</TableCell>
                            <TableCell>{tenant.apartmentnumber}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">

                                {/*dialog box to edit apartment number*/}
                                <Dialog open={isEditingTenant} onOpenChange={setIsEditingTenant}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Move Tenant</DialogTitle>
                                      <DialogDescription>Update the tenant's apartment number.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="newApartment" className="text-right">New Apartment</Label>
                                        <Input
                                          id="newApartment"
                                          value={editingTenant.apartmentnumber}
                                          onChange={(e) => setEditingTenant({...editingTenant, apartmentnumber: e.target.value})}
                                          className="col-span-3"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={() => handleMoveTenant(tenant.tenant_id)}>Move Tenant</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                {/*dialog box to delete a tenant*/}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirmation</DialogTitle>
                                      <DialogDescription>Are you sure you want to delete the tenant?</DialogDescription>
                                    </DialogHeader>

                                    <DialogFooter className='!justify-center'>
                                      <Button className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteTenant(tenant.tenant_id)}>Delete Tenant</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="maintenance" className="flex-1 overflow-auto">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Maintenance Team Management</CardTitle>
                  <CardDescription>Assign tasks and manage team members</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <div className="flex space-x-2 mb-4">
                    <Input placeholder="Search team members..." />
                    <Button>Assign Task</Button>
                  </div>
                  {/* Add maintenance team list or table here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}