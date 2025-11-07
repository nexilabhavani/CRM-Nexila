import { Link } from "react-router";
import { all_routes } from "../../../../../routes/all_routes";
import {
  Assign_From,
  Assign_To,
  Categorys,
  City,
  Company_Name,
  Country,
  Currency,
  Deals,
  Industry,
  Language,
  Leadstatus,
  Owner,
  Phone,
  Source,
  State,
} from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import { useState,useEffect} from "react";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import CommonPhoneInput from "../../../../../components/common-phoneInput/commonPhoneInput";
import { createLead } from "../../../../../api/leadApi";

import axios from "axios";
import LeadStatus from "./LeadStatus";

interface Lead {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  leadstatus?: string;
  leadsource?: string;
  collegename?: string;
  category?: string;
  location?: string;
  domain?: string;
  assignfrom?: string;
  assignto?: string;
  graduate?: string;
}

interface ModalLeadsProps {
  selectedLead: Lead | null;
  actionType: "edit" | "delete" | null;
  onUpdate: () => void;
}
const ModalLeads: React.FC<ModalLeadsProps> = ({
  selectedLead,
  actionType,
  onUpdate,
}) => {

  // const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // const handleChange = (value: string[]) => {
  //   setSelectedItems(value);
  // };

  //backend data store code

//    const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     collegename: "",
//     location: "",
//     category: "",
//     leadsource: "",
//     leadstatus: "",
//     domain: "",
//     assignfrom: "",
//     assignto: "",
//     graduate: "",
//   });

//    const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
  
// const validateForm = () => {
//     const newErrors: any = {};
//     Object.keys(formData).forEach((key) => {
//       if (!formData[key as keyof typeof formData]) {
//         newErrors[key] = "Please fill this field";
//       }
//     });
    
//     return Object.keys(newErrors).length === 0; // ✅ return true if no errors
//   };

//   // ✅ Handle text input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));   
//   };

//   // ✅ Handle select dropdowns
//   const handleSelectChange = (name: string, value: string) => {
//   setFormData((prev) => ({ ...prev, [name]: value }));
// };

  

   const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    collegename: "",
    location: "",
    category: "",
    leadsource: "",
    leadstatus: "",
    domain: "",
    assignfrom: "",
    assignto: "",
    graduate: "",
  });

  const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  const [lead, setLead] = useState<Lead | null>(null);
   

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Validate fields
  const validateForm = () => {
  const emptyFields = Object.entries(formData).filter(
    ([, value]) => !value || value.trim() === ""
  );

  if (emptyFields.length > 0) {
    console.warn("Missing fields:", emptyFields.map(([key]) => key));
    return false;
  }

  return true;
};
  // ✅ Handle text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle selects (from CommonSelect)

// For CommonSelect dropdowns:
const handleSelectChange = (name: string, value: string) => {
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
//Leadstaus option getting
useEffect(() => {
  const fetchLeadStatuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leadstatus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert backend data to dropdown-friendly format
      const formatted = res.data.map((item) => ({
        value: item.name,
        label: item.name,
      }));

      setLeadStatusOptions(formatted);
    } catch (err) {
      console.error("Error fetching lead statuses", err);
    }
  };

  fetchLeadStatuses();
}, []);


  // ✅ Submit form
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    alert("⚠️ Please fill all required fields.");
    return;
  }

  setLoading(true);
  try {
    const res = await createLead(formData);
    if (res.success) {
      alert("✅ Lead stored successfully!");
      console.log("Created lead:", res);
      setFormData({
        name: "",
        phone: "",
        email: "",
        collegename: "",
        location: "",
        category: "",
        leadsource: "",
        leadstatus: "",
        domain: "",
        assignfrom: "",
        assignto: "",
        graduate: "",
      });
    } else {
      alert("❌ Failed to store lead: " + (res.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Frontend error creating lead:", err);
    alert("❌ Could not connect to backend.");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  console.log("Form data updated:", formData);
}, [formData]);



useEffect(() => {
    if (selectedLead) {
      setLead(selectedLead);
    }
  }, [selectedLead])

  // ✅ Handle change
  const handlechange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleselectchange = (name: string, value: string) => {
  setLead((prev) => ({
    ...prev!,
    [name]: value,
  }));
};

  // ✅ Update handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !lead._id) return;

    try {
      await axios.put(`http://localhost:5000/api/leads/${lead._id}`, lead);
      alert("✅ Lead updated successfully");
      onUpdate();
    } catch (err) {
      alert("❌ Failed to update lead");
       console.error("❌ Update failed:", err);
    }
  };

  // ✅ Delete handler
const handleDelete = async () => {
  if (!lead || !lead._id) return;

  try {
    const res = await axios.delete(
      `http://localhost:5000/api/leads/${lead._id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ include token
        },
      }
    );

    if (res.data.success) {
      alert("🗑️ Lead deleted successfully");
      onUpdate();
    } else {
      alert("❌ Failed to delete lead");
      console.error("Backend error:", res.data);
    }
  } catch (err: any) {
    alert("❌ Failed to delete lead");
    console.error("Delete error:", err.response?.data || err.message);
  }
};

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!validateForm()) return;
//   setLoading(true);
//   setMessage("");

//   try {
//     const res = await createLead(formData);
//     console.log("✅ API Response:", res);

//     if (res.success) {
//       alert("Lead added successfully ✅");
//       setMessage("✅ Lead added successfully!");

//       // clear form
//       setFormData({
//         name: "",
//         phone: "",
//         email: "",
//         collegename: "",
//         location: "",
//         category: "",
//         leadsource: "",
//         leadstatus: "",
//         domain: "",
//         assignfrom: "",
//         assignto: "",
//         graduate: "",
//       });
//     } else {
//       alert("Failed to create lead ❌");
//       console.error("Error:", res.message);
//     }
//   } catch (error) {
//     console.error("Frontend error creating lead:", error);
//     alert("Something went wrong while creating lead ❌");
//   } finally {
//     setLoading(false);
//   }
// };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;
  //   setLoading(true);
  //   setMessage("");

  //   try {
  //     const res = await createLead(formData);
  //     setMessage("✅ Lead added successfully!");
  //     setFormData({
  //       name: "",
  //       phone: "",
  //       email: "",
  //       collegename: "",
  //       location: "",
  //       category: "",
  //       leadsource: "",
  //       leadstatus: "",
  //       domain: "",
  //       assignfrom: "",
  //       assignto: "",
  //       graduate: "",
  //     });
  //     console.log("Created lead:", res);
      
  //   } catch (error) {
  //    console.error("Error creating lead:", error);
  //     alert("Failed to create lead.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const options = [
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-02.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
          Robert Johnson
        </div>
      ),
      value: "robert-johnson",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/users/user-01.jpg"
              alt="Sharon"
              width={24}
              height={24}
            />
          </div>
          Sharon Roy
        </div>
      ),
      value: "sharon-roy",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-21.jpg"
              alt="Vaughan"
              width={24}
              height={24}
            />
          </div>
          Vaughan Lewis
        </div>
      ),
      value: "vaughan-lewis",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-23.jpg"
              alt="Jessica"
              width={24}
              height={24}
            />
          </div>
          Jessica Louise
        </div>
      ),
      value: "jessica-louise",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-16.jpg"
              alt="Carol"
              width={24}
              height={24}
            />
          </div>
          Carol Thomas
        </div>
      ),
      value: "carol-thomas",
    },
  ];

   const [selectedItems2, setSelectedItems2] = useState<string[]>([]);

  const handleChange2 = (value: string[]) => {
    setSelectedItems2(value);
  };
 const options2 = [
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-19.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
         Darlee Robertson
        </div>
      ),
      value: "robert-johnson",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/users/user-01.jpg"
              alt="Sharon"
              width={24}
              height={24}
            />
          </div>
          Sharon Roy
        </div>
      ),
      value: "sharon-roy",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-21.jpg"
              alt="Vaughan"
              width={24}
              height={24}
            />
          </div>
          Vaughan Lewis
        </div>
      ),
      value: "vaughan-lewis",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-23.jpg"
              alt="Jessica"
              width={24}
              height={24}
            />
          </div>
          Jessica Louise
        </div>
      ),
      value: "jessica-louise",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-16.jpg"
              alt="Carol"
              width={24}
              height={24}
            />
          </div>
          Carol Thomas
        </div>
      ),
      value: "carol-thomas",
    },
  ];

  // const [tags, setTags] = useState<string[]>(["Collab"]);
  // const handleTagsChange = (newTags: string[]) => {
  //   setTags(newTags);
  // };
  // const [tags2, setTags2] = useState<string[]>(["Collab", "VIP"]);
  // const handleTagsChange2 = (newTags: string[]) => {
  //   setTags2(newTags);
  // };

  // const [phone, setPhone] = useState<string | undefined>();
  // const [phone2, setPhone2] = useState<string | undefined>();

  return (
    <>
      {/* Add lead*/}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Lead</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleSubmit} >
        <div className="offcanvas-body">
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Name<span className="text-danger">*</span>
                  </label>
                 <input name="name" value={formData.name} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
              
              {/* <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Lead Type</label>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio1"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio1"
                      >
                        Person
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio2"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio2"
                      >
                        Organization
                      </label>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-md-12">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">Company Name</label>
                    <Link
                      to="#"
                      className="label-add link-primary mb-1"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_add_2"
                    >
                      <i className="ti ti-plus me-1" />
                      Add New
                    </Link>
                  </div>
                  <CommonSelect
                    options={Company_Name}
                    className="select"
                    defaultValue={Company_Name[0]}
                  />
                </div>
              </div> */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone<span className="text-danger">*</span>
                  </label>
                 <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className="form-control" required/>
              
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Email
                  </label>
                 <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              required
            />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                 Graduate <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    name="graduate"
                    value={formData.graduate}
                    onChange={handleSelectChange}
                    options={Currency}
                    className="select"
                    defaultValue={Currency[0]}
                  />

                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    College Name
                  </label>
                 <input type="text" name="collegename" placeholder="college Name" value={formData.collegename} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                   Catagory <span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="category"
                   value={formData.category}
                    onChange={handleSelectChange}
                    options={Categorys}
                    className="select"
                    defaultValue={Categorys[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Source <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                  name="leadsource"
                   value={formData.leadsource}
                    onChange={handleSelectChange}
                    options={Source}
                    className="select"
                    defaultValue={Source[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Domain <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                  name="domain"
                   value={formData.domain}
                    onChange={handleSelectChange}
                    options={Industry}
                    className="select"
                    defaultValue={Industry[0]}
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Location<span className="text-danger">*</span>
                  </label>
                <input type="text" name="location" placeholder="location" value={formData.location} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
              
               <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                  Assign From <span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="assignfrom"
                   value={formData.assignfrom}
                    onChange={handleSelectChange}
                    options={Assign_From}
                    className="select"
                    defaultValue={Assign_From[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                   <div className="d-flex align-items-center justify-content-between">
            <label className="form-label">
              Lead Status <span className="text-danger">*</span>
            </label>
                  <Link
              to="#"
              className="label-add link-primary"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_pipeline"
            >
              <i className="ti ti-plus me-1" />
              Add New
            </Link>
            </div>
                  <CommonSelect
                  name="leadstatus"
                   value={formData.leadstatus}
                    onChange={handleSelectChange}
                     options={leadStatusOptions} 
                    className="select"
                    defaultValue={Leadstatus[0]}
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                  Assign To<span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="assignto"
                   value={formData.assignto}
                    onChange={handleSelectChange}
                    options={Assign_To}
                    className="select"
                    defaultValue={Assign_To[0]}
                  />
                </div>
              </div>
             <div className="col-md-6">
        {/* <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <label className="form-label">
              Lead Status <span className="text-danger">*</span>
            </label>

           
            <Link
              to="#"
              className="label-add link-primary"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_pipeline"
            >
              <i className="ti ti-plus me-1" />
              Add New
            </Link>
          </div>

          <CommonSelect
            name="leadstatus"
            value={formData.leadstatus}
            onChange={handleSelectChange}
            options={leadStatusOptions} 
            className="select"
          />
        </div> */}
      </div>   

            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                 disabled={loading}
              >
                 {loading ? "Saving..." : "Create New"}
              </button>
            </div>
        </div>
        </form>
         {/* {message && <div className="alert alert-info mt-3">{message}</div>} */}
      </div>
      {/* /Add lead */}
      {/* Add offcanvas */}
      {/* ✅ Include the Offcanvas (LeadStatus) component here */}
      <LeadStatus />
      {/* <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_pipeline"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Pipeline</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          <div className="mb-3">
            <label className="form-label">
             Lead Status <span className="text-danger">*</span>
            </label>
            <input className="form-control" type="text" />
          </div>
          <div className="mb-3">
            <div className="pipe-title d-flex align-items-center justify-content-between mb-2">
              <label className="form-label m-0">Lead Status</label> */}
              {/* <Link
                to="#"
                className="add-stage link-primary"
                data-bs-toggle="modal"
                data-bs-target="#add_stage"
              >
                <i className="ti ti-plus me-1" />
                Add New
              </Link> */}
            {/* </div>
            <div className="pipeline-listing">
              <div className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning">
                <p className="mb-0 fw-semibold me-3 text-dark">
                  <i className="ti ti-grip-vertical text-body" /> Inpipeline
                </p>
                <div className="action-pipeline">
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Link>
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#delete_stage"
                    className="btn btn-sm btn-outline-light border-0"
                  >
                    <i className="ti ti-trash me-1" />
                    Delete
                  </Link>
                </div>
              </div> 
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Create New
          </button>
        </div>
      </form>
    </div>
  </div> */}
      {/* /Add offcanvas */}
      {/* Add New Stage */}
  {/* <div className="modal custom-modal fade" id="add_stage" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Add New Stage</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form >
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Stage Name<span className="ms-1 text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger">
              Create New
            </button>
          </div>
        </form>
      </div>
    </div>
  </div> */}
  {/* /Add New Stage */}
  {/* Edit Stage */}
  {/* <div className="modal custom-modal fade" id="edit_stage" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Edit Stage</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form >
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Edit Stage<span className="ms-1 text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Inpipeline"
              />
            </div>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div> */}
  {/* /Edit Stage */}
  {/* delete stage */}
  {/* <div className="modal fade" id="delete_stage">
    <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
      <div className="modal-content rounded-0">
        <div className="modal-body p-4 text-center position-relative">
          <div className="mb-3 position-relative z-1">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
              <i className="ti ti-trash fs-24" />
            </span>
          </div>
          <h5 className="mb-1">Remove Stage</h5>
          <p className="mb-3">
            Are you sure you want to remove stage you selected.
          </p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light position-relative z-1 me-2 w-100"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link
              to="#"
              className="btn btn-primary position-relative z-1 w-100"
              data-bs-dismiss="modal"
            >
              Yes, Delete
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div> */}
      {/* edit offcanvas */}
       <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Lead</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body" >
         {lead && (
            <form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Name<span className="text-danger">*</span>
                  </label>
                  <input
                    name="name"
                    className="form-control"
                    value={lead.name || ""}
                    onChange={handlechange}
                  />
                </div>
              </div> 
             <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Email
                  </label>
                 <input
                  name="email"
                  className="form-control"
                  value={lead.email || ""}
                onChange={handlechange}
            />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone
                  </label>
                 <input
                  name="phone"
                  className="form-control"
                  value={lead.phone || ""}
                onChange={handlechange}
            />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                 Graduate <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    name="graduate"
                    options={Currency}
                    className="select"
                    value={lead.graduate || ""}
                    onChange={handleselectchange}
                  />

                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    College Name
                  </label>
                 <input type="text" name="collegename"  value={lead.collegename || ""}
                onChange={handlechange} className="form-control" required/>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                   Catagory <span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="category"
                    value={lead.category || ""}
                    onChange={handleselectchange}
                    options={Categorys}
                    className="select"
                    
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Source <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                  name="leadsource"
                    value={lead.leadsource || ""}
                    onChange={handleselectchange}
                    options={Source}
                    className="select"
                    
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Domain <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                  name="domain"
                    value={lead.domain || ""}
                    onChange={handleselectchange}
                    options={Industry}
                    className="select"
                    
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Location<span className="text-danger">*</span>
                  </label>
                <input type="text" name="location" value={lead.location || ""}
                onChange={handlechange} className="form-control" required/>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                Lead Status<span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="leadstatus"
                    value={lead.leadstatus || ""}
                    onChange={handleselectchange}
                     options={leadStatusOptions} 
                    className="select"
                    
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                  Assign From <span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="assignfrom"
                   value={lead.assignfrom || ""}
                    onChange={handleselectchange}
                    options={Assign_From}
                    className="select"
                    
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">
                  Assign To<span className="text-danger">*</span> 
                  </label>
                  <CommonSelect
                  name="assignto"
                    value={lead.assignto || ""}
                    onChange={handleselectchange}
                    options={Assign_To}
                    className="select"
                    
                  />
                </div>
              </div> 
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                // data-bs-toggle="modal"
                // data-bs-target="#create_success"
                data-bs-dismiss="offcanvas"
              >
                Save Changes
              </button>
            </div>
          </form>
            )}
        </div>
      </div> 
      {/* edit offcanvas */}
      {/* success modal */}
      <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-info border-0 text-info rounded-circle">
                  <i className="ti ti-building-skyscraper fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Lead Created Successfully!!!</h5>
              <p className="mb-3">View the details of lead, created</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.leadsDetails}
                  className="btn btn-primary position-relative z-1 w-100"
                >
                  View Details
                </Link> 
                {/* <Link
                  to="#"
                  className="btn btn-primary position-relative z-1 w-100"
                >
                 OK
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* success modal */}
      {/* delete modal */}
      <div className="modal fade" id="delete_lead">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove leads you selected.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      <LeadStatus/>
    </>
  );
};

export default ModalLeads;
