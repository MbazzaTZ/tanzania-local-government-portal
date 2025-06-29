import React, { useState } from "react";
import locations from "../data/locations"; // Import location data
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";

export default function ReportingForm() {
  const [formData, setFormData] = useState({
    reportType: "",
    hideIdentity: "Hapana", // Default to No
    nidaNumber: "",
    reporterName: "",
    streetVillageHamlet: "",
    eventDate: "",
    eventTime: "",
    eventType: "",
    detailedDescription: "",
    evidenceUpload: null,
    department: "",
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
      console.log("Evidence Upload:", formData.evidenceUpload?.name);

      const docRef = await addDoc(collection(db, "reports"), {
        reportType: formData.reportType,
        hideIdentity: formData.hideIdentity,
        nidaNumber: formData.nidaNumber,
        reporterName: formData.reporterName,
        streetVillageHamlet: formData.streetVillageHamlet,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventType: formData.eventType,
        detailedDescription: formData.detailedDescription,
        department: formData.department,
        // evidenceUploadUrl: "...",
        timestamp: new Date(),
      });
      setMessage("Taarifa imewasilishwa kwa mafanikio! (Report submitted successfully!)");
      console.log("Document written with ID: ", docRef.id);
      // Reset form
      setFormData({
        reportType: "", hideIdentity: "Hapana", nidaNumber: "", reporterName: "",
        streetVillageHamlet: "", eventDate: "", eventTime: "", eventType: "",
        detailedDescription: "", evidenceUpload: null, department: "",
      });
      setSelectedDistrict("");
      setWards([]);
    } catch (e) {
      setMessage("Kuna tatizo wakati wa kuwasilisha taarifa. Jaribu tena. (Error submitting report. Please try again.)");
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-200 p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Fomu ya Kutoa Taarifa</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes("mafanikio") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Aina ya Taarifa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reportType" className="block text-gray-700 text-sm font-medium mb-2">Aina ya Taarifa*</label>
                <select
                  id="reportType"
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Chagua --</option>
                  <option value="Malalamiko">Malalamiko</option>
                  <option value="Arifa ya Tukio">Arifa ya Tukio</option>
                  <option value="Maombi ya Usaidizi">Maombi ya Usaidizi</option>
                  <option value="Nyingine">Nyingine</option>
                </select>
              </div>
              <div>
                <label htmlFor="hideIdentity" className="block text-gray-700 text-sm font-medium mb-2">Ficha Utambulisho?*</label>
                <select
                  id="hideIdentity"
                  name="hideIdentity"
                  value={formData.hideIdentity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Hapana">Hapana</option>
                  <option value="Ndiyo">Ndiyo</option>
                </select>
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Mtoa Taarifa na Eneo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nidaNumber" className="block text-gray-700 text-sm font-medium mb-2">Namba ya NIDA</label>
                <input
                  type="text"
                  id="nidaNumber"
                  name="nidaNumber"
                  value={formData.nidaNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="reporterName" className="block text-gray-700 text-sm font-medium mb-2">Jina la Mtoa Taarifa</label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="district" className="block text-gray-700 text-sm font-medium mb-2">Wilaya*</label>
                <select
                  id="district"
                  name="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                >
                  <option value="">-- Chagua Wilaya Kwanza --</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="streetVillageHamlet" className="block text-gray-700 text-sm font-medium mb-2">Jina la Mtaa/Kijiji/Kitongoji*</label>
                <input
                  type="text"
                  id="streetVillageHamlet"
                  name="streetVillageHamlet"
                  value={formData.streetVillageHamlet}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Muda na Aina ya Tukio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDate" className="block text-gray-700 text-sm font-medium mb-2">Tarehe ya Tukio*</label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-gray-700 text-sm font-medium mb-2">Muda wa Tukio</label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventType" className="block text-gray-700 text-sm font-medium mb-2">Aina ya Tukio*</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Chagua --</option>
                  <option value="Uhalifu">Uhalifu</option>
                  <option value="Ajali">Ajali</option>
                  <option value="Maafa ya Asili">Maafa ya Asili</option>
                  <option value="Miundombinu">Miundombinu</option>
                  <option value="Nyingine">Nyingine</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="detailedDescription" className="block text-gray-700 text-sm font-medium mb-2">Maelezo ya Kina*</label>
                <textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Ushahidi na Upelekaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="evidenceUpload" className="block text-gray-700 text-sm font-medium mb-2">Pakia Ushahidi (Picha/Video)</label>
                <input
                  type="file"
                  id="evidenceUpload"
                  name="evidenceUpload"
                  accept="image/*,video/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-gray-700 text-sm font-medium mb-2">Peleka kwa Idara Gani?*</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Chagua Idara --</option>
                  <option value="Ofisi ya Kata">Ofisi ya Kata</option>
                  <option value="Jeshi la Polisi">Jeshi la Polisi</option>
                  <option value="Idara ya Afya">Idara ya Afya</option>
                  <option value="Zimamoto na Uokoaji">Zimamoto na Uokoaji</option>
                  <option value="TANESCO">TANESCO</option>
                  <option value="DAWASA/RUWASA">DAWASA/RUWASA</option>
                  <option value="TARURA">TARURA</option>
                  <option value="Idara ya Ustawi wa Jamii">Idara ya Ustawi wa Jamii</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  reportType: "", hideIdentity: "Hapana", nidaNumber: "", reporterName: "",
                  streetVillageHamlet: "", eventDate: "", eventTime: "", eventType: "",
                  detailedDescription: "", evidenceUpload: null, department: "",
                });
                setSelectedDistrict("");
                setWards([]);
                setMessage("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Ghairi (Cancel)
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Wasilisha Taarifa (Submit Report)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
