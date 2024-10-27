'use client';
import { useSession } from "next-auth/react";
import { useState } from "react";
import axios from "axios";

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState({
    name: session?.user?.name || '',
    firstName: '',
    lastName: '',
    birthDate: '',
    address: '',
    phoneNumber: '',
  });

  const validateAddress = async (address) => {
    try {
      const response = await axios.get(
        `https://api-adresse.data.gouv.fr/search/?q=${address}&limit=1`
      );
      const { features } = response.data;
      if (features.length === 0) throw new Error("Address not found");
      
      const { geometry } = features[0];
      const [longitude, latitude] = geometry.coordinates;

      const parisLocation = [2.3522, 48.8566]; 
      const distance = calculateDistance(latitude, longitude, parisLocation[1], parisLocation[0]);
      
      return distance < 50; 
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isAddressValid = await validateAddress(userData.address);
    if (isAddressValid) {
      alert("Profile updated successfully.");
   
    } else {
      alert("Address must be within 50 km of Paris.");
    }
  };

  return (
    <div className="profile-page">
      <h1>Edit Profile</h1>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="First Name"
          value={userData.firstName}
          onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={userData.lastName}
          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={userData.birthDate}
          onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={userData.address}
          onChange={(e) => setUserData({ ...userData, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={userData.phoneNumber}
          onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}
