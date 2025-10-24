let events = [];
let eventIdCounter = 1;

// CREATE EVENT
app.post("/api/events", (req, res) => {
  const { name, description, location, skills, urgency, date } = req.body;
  const newEvent = {
    id: eventIdCounter++,
    name,
    description,
    location,
    skills,
    urgency,
    date
  };
  events.push(newEvent);
  res.status(201).json({ message: "Event created successfully", event: newEvent });
});

// GET ALL EVENTS
app.get("/api/events", (req, res) => {
  res.json(events);
});

// GET SINGLE EVENT
app.get("/api/events/:id", (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

// UPDATE EVENT
app.put("/api/events/:id", (req, res) => {
  const index = events.findIndex(e => e.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Event not found" });

  events[index] = { ...events[index], ...req.body };
  res.json({ message: "Event updated successfully", event: events[index] });
});