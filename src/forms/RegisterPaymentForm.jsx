import React, { useState } from "react";
import locations from "../data/locations"; // Import location data
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";

export default function RegisterPaymentForm() {
  const [formData, setFormData] = useState({
    paymentType: "",
    amount: "",
    description: "",
    nidaNumber: "",
    fullName: "",
    district: "",
    ward: "",
    street: "",
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const docRef = await addDoc(collection(db, "payments"), {
        paymentType: formData.paymentType,
        amount: parseFloat(formData.amount), // Convert to number
        description: formData.description,
        nidaNumber: formData.nidaNumber,
        fullName: formData.fullName,
        district: formData.district,
        ward: formData.ward,
        street: formData.street,
        timestamp: new Date(),
      });
      setMessage("Malipo yamesajiliwa kwa mafanikio! (Payment registered successfully!)");
      console.log("Document written with ID: ", docRef.id);
      // Reset form
      setFormData({
        paymentType: "", amount: "", description: "", nidaNumber: "",
        fullName: "", district: "", ward: "", street: "",
      });
      setSelectedDistrict("");
      setWards([]);
    } catch (e) {
      setMessage("Kuna tatizo wakati wa kusajili malipo. Jaribu tena. (Error registering payment. Please try again.)");
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sajili Malipo/Mchango</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes("mafanikio") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border-b pb-6 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Aina ya Malipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentType" className="block text-gray-700 text-sm font-medium mb-2">Aina ya Malipo*</label>
                <select
                  id="paymentType"
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">-- Chagua Aina --</option>
                  <option value="Mchango wa Maendeleo">Mchango wa Maendeleo</option>
                  <option value="Ada za Huduma">Ada za Huduma</option>
                  <option value="Faini">Faini</option>
                  <option value="Mengineyo">Mengineyo</option>
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-gray-700 text-sm font-medium mb-2">Kiasi (TSh)*</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Maelezo (Si lazima)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                ></textarea>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Taarifa za Mlipaji</h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                >
                  <option value="">-- Chagua Wilaya Kwanza --</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-gray-700 text-sm font-medium mb-2">Mtaa*</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  paymentType: "", amount: "", description: "", nidaNumber: "",
                  fullName: "", district: "", ward: "", street: "",
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
              Sajili Malipo (Register Payment)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
