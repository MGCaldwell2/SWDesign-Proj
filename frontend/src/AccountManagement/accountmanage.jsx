import React, { useState } from "react";
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
    availability: []
  });
  const [showPopup, setShowPopup] = useState(false);

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
    ["WI", "Wisconsin"], ["WY", "Wyoming"]
  ];

  const skillset = ["Spanish", "Chinese", "First Aid", "Crown Control", "Photography", "Food Handling", "Heavy Lifting", "Elder Care" 
];

  function FullNameField() {
    return (
      <div>
        <label htmlFor="fullName">Full Name (Required, Max 50 chars):</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          maxLength={50}
          required
        />
      </div>
    );
  }

  function AddressField() {
    return (
      <div>
        <label htmlFor="address1">Address Line 1 (Required, Max 100 chars):</label>
        <input
          type="text"
          id="address1"
          name="address1"
          maxLength={100}
          required
        />
        <label htmlFor="address2">Address Line 2 (Optional, Max 100 chars):</label>
        <input
          type="text"
          id="address2"
          name="address2"
          maxLength={100}
        />
      </div>
    );
  }

  function CityField() {
    return (
      <div>
        <label htmlFor="city">City (Required, Max 50 chars):</label>
        <input
          type="text"
          id="city"
          name="city"
          maxLength={50}
          required
        />
      </div>
    );
  }

  function StateField() {
    return (
      <div>
        <label htmlFor="state">State (Required):</label>
        <select id="state" name="state" required>
          <option value="">Select a state</option>
          {us_state.map(([abbreviation, name]) => (
            <option key={abbreviation} value={abbreviation}>
              {name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function ZipField() {
    return (
      <div>
        <label htmlFor="zip">Zip Code (Required, 5–9 digits):</label>
        <input
          type="text"
          id="zip"
          name="zip"
          pattern="\d{5,9}" // 5–9 digits
          maxLength={9}
          required
        />
      </div>
    );
  }

  function SkillsField() {
    return (
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
              />
              <label htmlFor={`skill-${skill}`}>{skill}</label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function PreferencesField() {
    return (
      <div>
        <label htmlFor="preferences">Job Preferences (Max 200 chars):</label>
        <textarea
          id="preferences"
          name="preferences"
          maxLength={200}
        />
      </div>
    );
  }

  function AvailabilityField() {
    const [dateInput, setDateInput] = useState("");
    const [dates, setDates] = useState([]);

    const addDate = () => {
      if (dateInput && !dates.includes(dateInput)) {
        setDates([...dates, dateInput]);
        setDateInput("");
      }
    };

    const removeDate = (dateToRemove) => {
      setDates(dates.filter(date => date !== dateToRemove));
    };

    return (
      <div>
        <label>Availability (Select multiple dates):</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <button type="button" onClick={addDate}>Add Date</button>
        <div className="availability-list">
          {dates.map(date => (
            <div key={date}>
              {date} <button type="button" onClick={() => removeDate(date)}>Remove</button>
              {/* add a hidden input so the date is submitted with the form */}
              <input type="hidden" name="availability" value={date} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Serialize form with support for repeated fields (checkbox groups, repeated names)
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);

    const payload = {
      full_name: fd.get("fullName") || "",
      address1: fd.get("address1") || "",
      address2: fd.get("address2") || "",
      city: fd.get("city") || "",
      state: fd.get("state") || "",
      zipcode: fd.get("zip") || "",
      skills: fd.getAll("skills"),
      preferences: fd.get("preferences") || "",
      availability: fd.getAll("availability"),
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
      // Optionally reset form here: form.reset();
    } catch (err) {
      console.error("Failed to save account", err);
      alert("Failed to save profile. See console for details.");
    }
  }

  return (
    <div className="account-manage-container">
      <form
        className="account-form"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4">Account Management</h2>
        <FullNameField />
        <AddressField />
        <CityField />
        <StateField />
        <ZipField />
        <SkillsField />
        <AvailabilityField />
        <PreferencesField />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>

      {/* Success popup */}
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