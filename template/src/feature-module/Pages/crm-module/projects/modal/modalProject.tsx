import { Link } from "react-router";
// import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import { useState,useEffect} from "react";
import {

  Industry,
  Lookingfor,Feetype,
  Internshipduration,

} from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
// import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
// import { all_routes } from "../../../../../routes/all_routes";
import dayjs from "dayjs";
import API_URL from "../../../../../api/apiconfig";
import axios from "axios";
interface Student {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  collegename?: string;
  category?: string;
  location?: string;
  domain?: string;
  assignfrom?: string;
  assignto?: string;
  graduate?: string;
  lookingfor?:string;
  internshipduration?:string;
  noofday?:string;
  dateofjoin?:string;
  fees?:string;
  feetype?:string;
  feepaid?:string;
  pendingfee?:string;
  payamount?:string;
}
interface ModalStudentsProps {
  selectedStudent: Student | null;
  actionType: "edit" | null;
  onUpdate: () => void;
}

const ModalProject: React.FC<ModalStudentsProps> = ({
 selectedStudent,
  actionType = null, // ✅ CORRECT
  onUpdate, 
}) => {
  
  const disableFutureAndOldDates = (current: dayjs.Dayjs) => {
    const today = dayjs().startOf("day");
    return current.isBefore(today);
  };

   const [userList, setUserList] = useState<any[]>([]); 
    // const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Student>({
      name: "",
      phone: "",
      // email: "",
      // collegename: "",
      // location: "",
      // category: "",
      domain: "",
      assignfrom: "",
      assignto: "",
      // graduate: "",
      lookingfor:"",
      internshipduration:"",
      noofday:"",
      dateofjoin:"",
      fees:"",
      feepaid:"",
      feetype:"",
      pendingfee:"",
      payamount:"",
    });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ get token from localStorage
  
        const res = await axios.get(`${API_URL}/users/list`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ include JWT in header
          },
        });
  
        console.log("Fetched users:", res.data);
        const formatted = res.data.map((u: any) => ({
         label: u.name,
         value: u._id,
        }));
        setUserList(formatted);
      } catch (err: any) {
        console.error("Failed to load users:", err.response?.data || err);
      }
    };
  
    fetchUsers();
  }, []);
  
  
// useEffect(() => {
//   if (selectedStudent && actionType === "edit") {
//     setFormData({
//       _id: selectedStudent._id,

//       name: selectedStudent.name ?? "",
//       phone: selectedStudent.phone ?? "",
//       // email: selectedStudent.email ?? "",
//       // collegename: selectedStudent.collegename ?? "",
//       // location: selectedStudent.location ?? "",
//       // category: selectedStudent.category ?? "",
//       domain: selectedStudent.domain ?? "",
//       assignto:selectedStudent.assignto ?? "",

//       // graduate: selectedStudent.graduate ?? "",
//       lookingfor: selectedStudent.lookingfor ?? "",
//       internshipduration: selectedStudent.internshipduration ?? "",
//       noofday: selectedStudent.noofday ?? "",
//       dateofjoin: selectedStudent.dateofjoin ?? "",

//       fees: selectedStudent.fees != null ? String(selectedStudent.fees) : "",
//       feepaid: selectedStudent.feepaid != null ? String(selectedStudent.feepaid) : "",
//       pendingfee:
//         selectedStudent.pendingfee != null
//           ? String(selectedStudent.pendingfee)
//           : "",

//       feetype: selectedStudent.feetype ?? "",
//     });
//   }
// }, [selectedStudent, actionType]);
useEffect(() => {
  if (selectedStudent) {
    setFormData({
      ...selectedStudent,
      assignto:
        typeof selectedStudent.assignto === "object"
          ? selectedStudent.assignto._id
          : selectedStudent.assignto,
    });
  }
}, [selectedStudent]);

  //   
  const validateForm = () => {
    // Always optional fields (base)
    const alwaysIgnore = [
      "email",
      "collegename","pendingfee","followdate"
    ];
  
    // Conditions

    const isInternship =
      formData.lookingfor === "Internship";

    // Conditionally ignored fields
    const conditionalIgnore = [
      ...(isInternship ? [] : ["internshipduration"]),
    ];
  
    const fieldsToIgnore = [...alwaysIgnore, ...conditionalIgnore];
  
    // ❌ EMPTY FIELD VALIDATION
    const emptyFields = Object.entries(formData).filter(
      ([key, value]) =>
        !fieldsToIgnore.includes(key) &&
        (!value || value.toString().trim() === "")
    );
  
    if (emptyFields.length > 0) {
      alert(`Please fill required fields: ${emptyFields.map(([k]) => k).join(", ")}`);
      return false;
    }
  
    return true;
  };

    // ✅ Handle text inputs
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ): void => {
      const { name, value } = e.target;
       if (name === "phone") {
      if (!/^\d*$/.test(value)) return; // ❌ block letters/symbols
      if (value.length > 10) return;    // ❌ block >10 digits
    }
  
       if (name === "fees" || name==="feepaid" || name==="pendingfee" || name==="noofday") {
      if (!/^\d*$/.test(value)) return; // ❌ block letters/symbols
    }
  
    // 👤 NAME – allow only letters & spaces
    if (name === "name" || name === "collegename") {
      if (!/^[A-Za-z ]*$/.test(value)) return; // ❌ block numbers/symbols
    }
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

   const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;
  if (!formData?._id) return;

  try {
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      assignto: formData.assignto || null,
    };

    await axios.put(
      `${API_URL}/students/${formData._id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    alert("✅ Student updated successfully");
    onUpdate();

  } catch (err) {
    console.error("❌ Update failed:", err);
    alert("❌ Failed to update student");
  }
};


// const handlePayment = async (e) => {
//   e.preventDefault();

//   if (!formData.payamount) {
//     alert("Enter payment amount");
//     return;
//   }

//   try {
//     const token = localStorage.getItem("token");
//     const res = await axios.put(
//       `/api/student/pay-fee/${formData._id}`,
//       { payamount: formData.payamount },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     alert("Payment successful");

//     // ✅ Update UI with latest values
//     setFormData(prev => ({
//       ...prev,
//       feepaid: res.data.student.feepaid,
//       pendingfee: res.data.student.pendingfee,
//       payamount: ""
//     }));

//   } catch (err) {
//     alert(err.response?.data?.message || "Payment failed");
//   }
// };

  
//    const options = [
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-02.jpg"
//               alt="Robert"
//               width={24}
//               height={24}
//             />
//           </div>
//           Robert Johnson
//         </div>
//       ),
//       value: "robert-johnson",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/users/user-01.jpg"
//               alt="Sharon"
//               width={24}
//               height={24}
//             />
//           </div>
//           Sharon Roy
//         </div>
//       ),
//       value: "sharon-roy",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-21.jpg"
//               alt="Vaughan"
//               width={24}
//               height={24}
//             />
//           </div>
//           Vaughan Lewis
//         </div>
//       ),
//       value: "vaughan-lewis",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-23.jpg"
//               alt="Jessica"
//               width={24}
//               height={24}
//             />
//           </div>
//           Jessica Louise
//         </div>
//       ),
//       value: "jessica-louise",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-16.jpg"
//               alt="Carol"
//               width={24}
//               height={24}
//             />
//           </div>
//           Carol Thomas
//         </div>
//       ),
//       value: "carol-thomas",
//     },
//   ];

//   const [selectedItems2, setSelectedItems2] = useState<string[]>([]);

//   const handleChange2 = (value: string[]) => {
//     setSelectedItems2(value);
//   };
//  const options2 = [
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-19.jpg"
//               alt="Robert"
//               width={24}
//               height={24}
//             />
//           </div>
//          Darlee Robertson
//         </div>
//       ),
//       value: "robert-johnson",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/users/user-01.jpg"
//               alt="Sharon"
//               width={24}
//               height={24}
//             />
//           </div>
//           Sharon Roy
//         </div>
//       ),
//       value: "sharon-roy",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-21.jpg"
//               alt="Vaughan"
//               width={24}
//               height={24}
//             />
//           </div>
//           Vaughan Lewis
//         </div>
//       ),
//       value: "vaughan-lewis",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-23.jpg"
//               alt="Jessica"
//               width={24}
//               height={24}
//             />
//           </div>
//           Jessica Louise
//         </div>
//       ),
//       value: "jessica-louise",
//     },
//     {
//       label: (
//         <div className="d-flex align-items-center gap-2">
//           <div
//             style={{
//               borderRadius: "50%",
//               overflow: "hidden",
//               width: 24,
//               height: 24,
//             }}
//           >
//             <ImageWithBasePath
//               src="assets/img/profiles/avatar-16.jpg"
//               alt="Carol"
//               width={24}
//               height={24}
//             />
//           </div>
//           Carol Thomas
//         </div>
//       ),
//       value: "carol-thomas",
//     },
//   ];
  return (
    <>
      {/* Add Canvas */}
      {/* <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Project</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Project ID<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Project Type <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Project_Type}
                    className="select"
                    defaultValue={Project_Type[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Client <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Client}
                    className="select"
                    defaultValue={Client[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Category}
                    className="select"
                    defaultValue={Category[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Project Timing <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Project_Timing}
                    className="select"
                    defaultValue={Project_Timing[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Price <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Responsible Persons <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Team Leader <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems2}
                    onChange={handleChange2}
                    options={options2}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Due Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <CommonSelect name=""
                    options={Priority}
                    className="select"
                    defaultValue={Priority[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <CommonSelect name=""
                    options={StatusActive}
                    className="select"
                    defaultValue={StatusActive[0]}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    defaultValue={""}
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
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#create_success"
              >
                Create New
              </button>
            </div>
          </form>
        </div>
      </div> */}
      {/* /Add Canvas */}
      {/* Add Canvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Student</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
            {formData && (
          <form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                 <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
             <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Mobile No<span className="text-danger">*</span>
                  </label>
                 <input name="phone" type="tel" value={formData.phone ?? ""} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Domain <span className="text-danger">*</span>
                  </label>
                  <CommonSelect 
                    name="domain"
                    value={formData.domain ?? ""}
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
                              Date of Joining <span className="text-danger">*</span>
                            </label>
                            <div className="input-group w-auto input-group-flat">
                              <CommonDatePicker
                      placeholder="dd/mm/yyyy"
                      format="DD/MM/YYYY"
                      value={formData.dateofjoin ? dayjs(formData.dateofjoin) : null}
                      disabledDate={disableFutureAndOldDates}
                      onChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          dateofjoin: date ? date.format("YYYY-MM-DD") : "",
                        }))
                      }
              
                      
                    />
              
                            </div>
                          </div>
                        </div>
               <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Fees<span className="text-danger">*</span>
                  </label>
                 <input name="fees" type="text" value={formData.fees ?? ""} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Pending Fees<span className="text-danger"></span>
                  </label>
                  <input name="pendingfee" type="text" value={formData.pendingfee ?? ""} onChange={handleInputChange} disabled  className="form-control" />
                </div>
              </div>
               <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Fees Paid<span className="text-danger">*</span>
                  </label>
                 <input name="feepaid" type="text" value={formData.feepaid ?? ""} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
                <div className="col-md-6">
                  <div className="mb-3">
                        <label className="form-label">
                       FeeType<span className="text-danger">*</span> 
                       </label>
                                <CommonSelect
                                name="feetype"
                                  value={formData.feetype ?? ""}
                                  onChange={handleSelectChange}
                                  options={Feetype}
                                  className="select"
                                  
                                />
                             </div>
                </div>
              <div className="col-md-6">
                  <div className="mb-3">
                        <label className="form-label">
                        Trainer<span className="text-danger">*</span> 
                       </label>
                                <CommonSelect
                                name="assignto"
                                  value={formData.assignto ?? ""}
                                  onChange={handleSelectChange}
                                  options={userList}
                                  className="select"
                                  
                                />
                             </div>
                </div>
               <div className="col-md-6">
                  <div className="mb-3">
                        <label className="form-label">
                        Looking for<span className="text-danger">*</span> 
                       </label>
                                <CommonSelect
                                name="lookingfor"
                                  value={formData.lookingfor ?? ""}
                                  onChange={handleSelectChange}
                                  options={Lookingfor}
                                  className="select"
                                  
                                />
                             </div>
                </div>
                 {(formData.lookingfor === "Internship") && (
                   <div className="col-md-6">
                  <div className="mb-3">
                        <label className="form-label">
                       <span className="text-danger">*</span> 
                       </label>
                                <CommonSelect
                                name="internshipduration"
                                  value={formData.internshipduration ?? ""}
                                  onChange={handleSelectChange}
                                  options={Internshipduration}
                                  className="select"
                                  
                                />
                             </div>
                </div>
                 )}   
                   {(formData.lookingfor === "Course") && (
                     <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    No of Days<span className="text-danger">*</span>
                  </label>
                 <input name="noofday" type="text" value={formData.noofday ?? ""} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
                   )}

              {/*  <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Client <span className="text-danger">*</span>
                  </label> 
                  <CommonSelect name=""
                    options={Client}
                    className="select"
                    defaultValue={Client[1]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Category}
                    className="select"
                    defaultValue={Category[1]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Project Timing <span className="text-danger">*</span>
                  </label>
                  <CommonSelect name=""
                    options={Project_Timing}
                    className="select"
                    defaultValue={Project_Timing[1]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Price <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    defaultValue="2,15,000"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Responsible Persons <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Team Leader <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems2}
                    onChange={handleChange2}
                    options={options2}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Due Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <CommonSelect name=""
                    options={Priority}
                    className="select"
                    defaultValue={Priority[1]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <CommonSelect name=""
                    options={StatusActive}
                    className="select"
                    defaultValue={StatusActive[1]}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    defaultValue={
                     "Provides a multiple ondemand service marketplace"
                     }
                  />
                </div>
              </div> */}
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
              >
              Save Changes
              </button>
            </div>
          </form>
          )}
        </div>
        
      </div>
      {/* /Add Canvas */}
      {/* success modal */}
      {/* <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-info border-0 text-info rounded-circle">
                  <i className="ti ti-atom-2 fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Project Created Successfully!!!</h5>
              <p className="mb-3">View the details of project, created</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.projectDetails}
                  className="btn btn-primary position-relative z-1 w-100"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* success modal */}
      {/* delete modal */}
      {/* used<div className="modal fade" id="delete_project">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
           <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
               <h5 className="mb-1">Update Fees</h5> */}
                {/* <i className="ti ti-trash fs-24" />
               <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove project you selected.
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
              </div>*/}
              {/*used form <form onSubmit={handlePayment}>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Fees<span className="text-danger">*</span>
                  </label>
                 <input name="fees" type="text" value={formData.fees ?? ""} onChange={handleInputChange} className="form-control" disabled required/>
                </div>
              </div>
               <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Pending Fees<span className="text-danger"></span>
                  </label>
                  <input name="pendingfee" type="text" value={formData.pendingfee ?? ""} onChange={handleInputChange} disabled className="form-control" />
                </div>
              </div>
               <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Fees Paid<span className="text-danger">*</span>
                  </label>
                 <input name="feepaid" type="text" value={formData.feepaid ?? ""} onChange={handleInputChange} disabled className="form-control" required/>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Pay Amount<span className="text-danger">*</span>
                  </label>
                 <input name="payamount" type="text" placeholder="Enter payment amount" value={formData.payamount ?? ""} onChange={handleInputChange} className="form-control" required/>
                </div>
              </div>
                <div className="col-md-12">
                  <div className="mb-3">
                        <label className="form-label">
                       FeeType<span className="text-danger">*</span> 
                       </label>
                                <CommonSelect
                                name="feetype"
                                  value={formData.feetype ?? ""}
                                  onChange={handleSelectChange}
                                  options={Feetype}
                                  className="select"
                                  
                                />
                             </div>
                </div> */}
                 {/* <div className="d-flex justify-content-center">
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
                  Update
                </Link>
              </div> */}
              {/* used button <div className="d-flex align-items-center justify-content-end">
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
              >
              Update
              </button>
            </div>
            </form>
            </div> 
          
          </div>
        </div> 
      </div>*/} 
      {/* delete modal */}
    </>
  );
};

export default ModalProject;
