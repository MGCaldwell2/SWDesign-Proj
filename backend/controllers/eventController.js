let events = [];
let currentId = 1;

export const getAllEvents = (req, res) => {
  res.json(events);
};

export const getEventById = (req, res) => {
  const event = events.find((e) => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
};

export const createEvent = (req, res) => {
  const newEvent = { id: currentId++, ...req.body };
  events.push(newEvent);
  res.status(201).json(newEvent);
};

export const updateEvent = (req, res) => {
  const id = parseInt(req.params.id);
  const index = events.findIndex((e) => e.id === id);

  if (index === -1) return res.status(404).json({ message: "Event not found" });

  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
};
