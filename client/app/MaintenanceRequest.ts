// type object for a MaintenanceRequest
type MaintenanceRequest = {
  id: string;
  apartmentNumber: string;
  area: string;
  description: string;
  dateTime: string;
  photo: string | undefined;
  status: string;
  urgency: string;
  comment: string | null;
};

export default MaintenanceRequest;