
export interface Project {
  id: string;
  title: string;
  client: string;
  logo: string; // URL or placeholder char
  budget: string;
  status: "In Progress" | "Planning" | "Completed" | "On Hold";
  progress: number;
  dueDate: string;
  completionDate?: string;
  team: string[]; // Initials of team members
}

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    client: "Acme Corp",
    logo: "A",
    budget: "$12,000",
    status: "In Progress",
    progress: 75,
    dueDate: "Dec 25, 2024",
    team: ["JD", "AS", "KD"]
  },
  {
    id: "2",
    title: "Mobile App Development",
    client: "Globex Inc",
    logo: "G",
    budget: "$45,000",
    status: "Planning",
    progress: 15,
    dueDate: "Jan 15, 2025",
    team: ["JD", "MR"]
  },
  {
    id: "3",
    title: "Brand Identity",
    client: "Soylent Corp",
    logo: "S",
    budget: "$8,500",
    status: "Completed",
    progress: 100,
    dueDate: "Nov 30, 2024",
    completionDate: "Nov 28, 2024",
    team: ["AS"]
  },
  {
    id: "4",
    title: "E-commerce Platform",
    client: "Umbrella Corp",
    logo: "U",
    budget: "$60,000",
    status: "In Progress",
    progress: 40,
    dueDate: "Feb 28, 2025",
    team: ["JD", "KD", "MR", "AS"]
  },
  {
    id: "5",
    title: "Marketing Campaign",
    client: "Stark Ind",
    logo: "S",
    budget: "$25,000",
    status: "On Hold",
    progress: 50,
    dueDate: "TBD",
    team: ["KD", "MR"]
  },
  {
    id: "6",
    title: "SEO Optimization",
    client: "Cyberdyne Systems",
    logo: "C",
    budget: "$5,000",
    status: "Completed",
    progress: 100,
    dueDate: "Oct 15, 2024",
    completionDate: "Oct 20, 2024",
    team: ["JD"]
  }
];
