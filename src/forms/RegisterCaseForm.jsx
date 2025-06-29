import React, { useState } from "react";
import locations from "../data/locations"; // Import location data
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";

export default function RegisterCaseForm() {
  const [formData, setFormData] = useState({
    complainantName: "",
    complainantPhone: "",
    defendantName: "",
    district: "",
    ward: "",
    street: "",
    caseType: "",
    caseFee: "",
    caseSubject: "",
    detailedDescription: "",
    evidenceAttachments: null,
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
      console.log("Evidence Attachments:", formData.evidenceAttachments?.name);

      const docRef = await addDoc(collection(db, "registeredCases"), {
        complainantName: formData.complainantName,
        complainantPhone: formData.complainantPhone,
        defendantName: formData.defendantName,
        district: formData.district,
        ward: formData.ward,
        street: formData.street,
        caseType: formData.caseType,
        caseFee: formData.caseFee,
        caseSubject: formData.caseSubject,
        detailedDescription: formData.detailedDescription,
        // evidenceAttachmentsUrl: "...",
        timestamp: new Date(),
      });
      setMessage("Kesi imesajiliwa kwa mafanikio! (Case registered successfully!)");
      console.log("Document written with ID: ", docRef.id);
      // Reset form
      setFormData({
        complainantName: "", complainantPhone: "", defendantName: "",
        district: "", ward: "", street: "", caseType: "", caseFee: "",
        caseSubject: "", detailedDescription: "", evidenceAttachments: null,
      });
      setSelectedDistrict("");
      setWards([]);
    } catch (e) {
      setMessage("Kuna tatizo wakati wa kusajili kesi. Jaribu tena. (Error registering case. Please try again.)");
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-200 p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sajili Kesi Mpya</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes("mafanikio") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Taarifa za Mlalamikaji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="complainantName" className="block text-gray-700 text-sm font-medium mb-2">Jina Kamili</label>
                <input
                  type="text"
                  id="complainantName"
                  name="complainantName"
                  value={formData.complainantName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="complainantPhone" className="block text-gray-700 text-sm font-medium mb-2">Namba ya Simu</label>
                <input
                  type="tel"
                  id="complainantPhone"
                  name="complainantPhone"
                  value={formData.complainantPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Taarifa za Mlalamikiwa</h3>
            <div>
              <label htmlFor="defendantName" className="block text-gray-700 text-sm font-medium mb-2">Jina la Mlalamikiwa</label>
              <input
                type="text"
                id="defendantName"
                name="defendantName"
                value={formData.defendantName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Eneo la Kesi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="district" className="block text-gray-700 text-sm font-medium mb-2">Wilaya*</label>
                <select
                  id="district"
                  name="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </section>

          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Maelezo ya Kesi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="caseType" className="block text-gray-700 text-sm font-medium mb-2">Aina ya Kesi*</label>
                <select
                  id="caseType"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">-- Chagua Aina --</option>
                  <option value="Mgogoro wa Ardhi Mdogo">Mgogoro wa Ardhi Mdogo</option>
                  <option value="Mgogoro wa Ardhi Mkubwa">Mgogoro wa Ardhi Mkubwa</option>
                  <option value="Suala la Familia">Suala la Familia</option>
                  <option value="Mgogoro wa Kibiashara">Mgogoro wa Kibiashara</option>
                  <option value="Madai Madogo">Madai Madogo</option>
                  <option value="Uharibifu wa Mali">Uharibifu wa Mali</option>
                  <option value="Nyingineyo">Nyingineyo</option>
                </select>
              </div>
              <div>
                <label htmlFor="caseFee" className="block text-gray-700 text-sm font-medium mb-2">Ada ya Ufunguzi wa Kesi (TSh)</label>
                <input
                  type="number"
                  id="caseFee"
                  name="caseFee"
                  value={formData.caseFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="E.g., 20000"
                />
              </div>
              <div>
                <label htmlFor="caseSubject" className="block text-gray-700 text-sm font-medium mb-2">Mada / Kichwa cha Kesi</label>
                <input
                  type="text"
                  id="caseSubject"
                  name="caseSubject"
                  value={formData.caseSubject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="detailedDescription" className="block text-gray-700 text-sm font-medium mb-2">Maelezo ya Kina</label>
                <textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Viambatisho vya Ushahidi</h3>
            <div>
              <label htmlFor="evidenceAttachments" className="block text-gray-700 text-sm font-medium mb-2">Pakia Ushahidi (Picha/Video/Nyaraka)</label>
              <input
                type="file"
                id="evidenceAttachments"
                name="evidenceAttachments"
                accept="image/*,video/*,application/pdf"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  complainantName: "", complainantPhone: "", defendantName: "",
                  district: "", ward: "", street: "", caseType: "", caseFee: "",
                  caseSubject: "", detailedDescription: "", evidenceAttachments: null,
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
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Sajili Kesi (Register Case)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
