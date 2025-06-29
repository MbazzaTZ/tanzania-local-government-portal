import React, { useState } from "react";
import locations from "../data/locations"; // Import location data
import { db } from "../firebase-config"; // Assuming db is exported from firebase-config.js
import { collection, addDoc } from "firebase/firestore";

export default function IdentityRequestForm() {
  const [formData, setFormData] = useState({
    nidaNumber: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    district: "",
    ward: "",
    street: "",
    recipientName: "",
    recipientAddress: "",
    purpose: "",
    applicantImage: null,
    nidaIdUpload: null,
  });
  const [message, setMessage] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [wards, setWards] = useState([]);

  const districts = Object.keys(locations["Dar Es Salaam Region"]);

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setFormData({ ...formData, district: district, ward: "" }); // Reset ward when district changes
    if (district && locations["Dar Es Salaam Region"][district]) {
      // Flatten all wards from all sub-objects within the selected district
      const allWardsInDistrict = Object.values(locations["Dar Es Salaam Region"][district]).flat();
      setWards(allWardsInDistrict);
    } else {
      setWards([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // For file uploads, you'd typically upload to Firebase Storage and save the URL
      // For this example, we'll just log the file names and proceed with text data
      console.log("Applicant Image:", formData.applicantImage?.name);
      console.log("NIDA ID Upload:", formData.nidaIdUpload?.name);

      const docRef = await addDoc(collection(db, "identityRequests"), {
        nidaNumber: formData.nidaNumber,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        district: formData.district,
        ward: formData.ward,
        street: formData.street,
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        purpose: formData.purpose,
        // In a real app, you'd save file URLs here
        // applicantImageUrl: "...",
        // nidaIdUploadUrl: "...",
        timestamp: new Date(),
      });
      setMessage("Ombi la Utambulisho limewasilishwa kwa mafanikio! (Identity Request submitted successfully!)");
      console.log("Document written with ID: ", docRef.id);
      // Reset form
      setFormData({
        nidaNumber: "", fullName: "", phoneNumber: "", email: "",
        district: "", ward: "", street: "", recipientName: "",
        recipientAddress: "", purpose: "", applicantImage: null, nidaIdUpload: null,
      });
      setSelectedDistrict("");
      setWards([]);
    } catch (e) {
      setMessage("Kuna tatizo wakati wa kuwasilisha ombi. Jaribu tena. (Error submitting request. Please try again.)");
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Fomu ya Ombi la Utambulisho</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes("mafanikio") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Taarifa za Mwombaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nidaNumber" className="block text-gray-700 text-sm font-medium mb-2">Namba ya NIDA*</label>
                <input
                  type="text"
                  id="nidaNumber"
                  name="nidaNumber"
                  value={formData.nidaNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-2">Jina Kamili*</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-medium mb-2">Namba ya Simu*</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Barua Pepe</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Makazi ya Mwombaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="district" className="block text-gray-700 text-sm font-medium mb-2">Wilaya*</label>
                <select
                  id="district"
                  name="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chagua Wilaya --</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ward" className="block text-gray-700 text-sm font-medium mb-2">Kata*</label>
                <select
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  required
                  disabled={!selectedDistrict}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">-- Chagua Wilaya Kwanza --</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="street" className="block text-gray-700 text-sm font-medium mb-2">Mtaa*</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Picha na Nyaraka</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="applicantImage" className="block text-gray-700 text-sm font-medium mb-2">Picha ya Mwombaji</label>
                <input
                  type="file"
                  id="applicantImage"
                  name="applicantImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button type="button" className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                  Tumia Kamera
                </button>
              </div>
              <div>
                <label htmlFor="nidaIdUpload" className="block text-gray-700 text-sm font-medium mb-2">Pakia Kitambulisho (NIDA)*</label>
                <input
                  type="file"
                  id="nidaIdUpload"
                  name="nidaIdUpload"
                  accept="image/*,application/pdf"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Taarifa za Mpokeaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="recipientName" className="block text-gray-700 text-sm font-medium mb-2">Jina la Mpokeaji/Taasisi*</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="recipientAddress" className="block text-gray-700 text-sm font-medium mb-2">Anuani*</label>
                <input
                  type="text"
                  id="recipientAddress"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Madhumuni ya Barua</h3>
            <div>
              <label htmlFor="purpose" className="block text-gray-700 text-sm font-medium mb-2">Madhumuni ya Barua*</label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chagua Madhumuni --</option>
                <option value="Kufungua Akaunti ya Benki">Kufungua Akaunti ya Benki</option>
                <option value="Uthibitisho wa Makazi">Uthibitisho wa Makazi</option>
                <option value="Maombi ya Kazi">Maombi ya Kazi</option>
                <option value="Usajili wa Laini ya Simu">Usajili wa Laini ya Simu</option>
                <option value="Nyingineyo">Nyingineyo</option>
              </select>
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nidaNumber: "", fullName: "", phoneNumber: "", email: "",
                  district: "", ward: "", street: "", recipientName: "",
                  recipientAddress: "", purpose: "", applicantImage: null, nidaIdUpload: null,
                });
                setSelectedDistrict("");
                setWards([]);
                setMessage("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Futa (Clear)
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Wasilisha Ombi (Submit Request)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
