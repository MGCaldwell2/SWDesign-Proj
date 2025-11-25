import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./accountmanage.css";

export default function AccountManage({ states = [], skills = [] }) {
  const [formData, setFormData] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });
  const [dateInput, setDateInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load current user from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser"));
      if (stored?.id) setUserId(stored.id);
      if (stored?.role) setUserRole(stored.role);
    } catch {}
  }, []);

  // Normalize skills/availability from backend
  const normalizeArrayField = (raw) => {
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === "string" ? v.trim() : String(v).trim()))
        .filter(Boolean);
    }

    if (raw == null) return [];

    if (typeof raw === "string") {
      const trimmed = raw.trim();

      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed
              .map((v) =>
                typeof v === "string" ? v.trim() : String(v).trim()
              )
              .filter(Boolean);
          }
        } catch {
          // fall through to CSV
        }
      }

      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [String(raw).trim()].filter(Boolean);
  };

  // Load profile once we know userId
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/accounts/account?user_id=${userId}`
        );

        if (res.status === 404) {
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);

        const data = await res.json();
        console.log("Loaded profile from backend:", data);

        const normalizedSkills = normalizeArrayField(data.skills);
        const normalizedAvailability = normalizeArrayField(data.availability);

        setFormData({
          fullName: data.full_name || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zipcode || "",
          skills: normalizedSkills,
          preferences: data.preferences || "",
          availability: normalizedAvailability,
        });
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const us_state = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
    ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
    ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
    ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
    ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
    ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
    ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
    ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
    ["WI", "Wisconsin"], ["WY", "Wyoming"],
  ];

  const skillset = [
    "Spanish",
    "Chinese",
    "First Aid",
    "Crowd Control",
    "Photography",
    "Food Handling",
    "Heavy Lifting",
    "Elder Care",
  ];

  // Generic text/select handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle a skill checkbox
  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const hasSkill = prev.skills.includes(skill);
      return {
        ...prev,
        skills: hasSkill
          ? prev.skills.filter((s) => s !== skill)
          : [...prev.skills, skill],
      };
    });
  };

  // Availability helpers
  const addAvailabilityDate = () => {
    if (!dateInput) return;
    setFormData((prev) => {
      if (prev.availability.includes(dateInput)) return prev;
      return {
        ...prev,
        availability: [...prev.availability, dateInput],
      };
    });
    setDateInput("");
  };

  const removeAvailabilityDate = (dateToRemove) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((d) => d !== dateToRemove),
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!userId) {
      alert("Missing user ID. Please re-login.");
      return;
    }

    const payload = {
      user_id: userId,
      full_name: formData.fullName,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zip,
      skills: formData.skills,
      preferences: formData.preferences,
      availability: formData.availability,
    };

    try {
      const res = await fetch("http://localhost:5050/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const saved = await res.json();
      console.log("Saved account (MySQL):", saved);
      setShowPopup(true);

      const target = userRole === "admin" ? "/admin/dashboard" : "/dashboard";
      setTimeout(() => navigate(target), 800);
    } catch (err) {
      console.error("Failed to save account", err);
      alert("Failed to save profile. See console for details.");
    }
  }

  if (loading) {
    return (
      <div className="account-manage-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="account-manage-container">
      <form className="account-form" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Account Management</h2>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName">
            Full Name (Required, Max 50 chars):
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            maxLength={50}
            required
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address1">
            Address Line 1 (Required, Max 100 chars):
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            maxLength={100}
            required
            value={formData.address1}
            onChange={handleInputChange}
          />
          <label htmlFor="address2">
            Address Line 2 (Optional, Max 100 chars):
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            maxLength={100}
            value={formData.address2}
            onChange={handleInputChange}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city">City (Required, Max 50 chars):</label>
          <input
            type="text"
            id="city"
            name="city"
            maxLength={50}
            required
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>

        {/* State */}
        <div>
          <label htmlFor="state">State (Required):</label>
          <select
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleInputChange}
          >
            <option value="">Select a state</option>
            {us_state.map(([abbreviation, name]) => (
              <option key={abbreviation} value={abbreviation}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Zip */}
        <div>
          <label htmlFor="zip">Zip Code (Required, 5–9 digits):</label>
          <input
            type="text"
            id="zip"
            name="zip"
            pattern="\d{5,9}"
            maxLength={9}
            required
            value={formData.zip}
            onChange={handleInputChange}
          />
        </div>

        {/* Skills */}
        <div>
          <label>Skills (Select multiple if applicable):</label>
          <div className="skills-group">
            {skillset.map((skill) => (
              <div key={skill} className="skill-item">
                <input
                  type="checkbox"
                  id={`skill-${skill}`}
                  name="skills"
                  value={skill}
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                <label htmlFor={`skill-${skill}`}>{skill}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label>Availability (Select multiple dates):</label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <button type="button" onClick={addAvailabilityDate}>
            Add Date
          </button>
          <div className="availability-list">
            {formData.availability.map((date) => (
              <div key={date}>
                {date}{" "}
                <button
                  type="button"
                  onClick={() => removeAvailabilityDate(date)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <label htmlFor="preferences">
            Job Preferences (Max 200 chars):
          </label>
          <textarea
            id="preferences"
            name="preferences"
            maxLength={200}
            value={formData.preferences}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
        {!userId && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>
            User ID not found – cannot save profile.
          </p>
        )}
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>Profile saved successfully!</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}