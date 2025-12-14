import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Briefcase, MapPin, DollarSign } from "lucide-react";

interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
}

const jobs: Job[] = [
  { title: "Software Engineer", company: "Tech Corp", location: "São Paulo, SP", salary: "R$ 12k-18k" },
  { title: "Frontend Developer", company: "StartupXYZ", location: "Remote", salary: "R$ 10k-15k" },
  { title: "Full Stack Engineer", company: "DevCompany", location: "Rio de Janeiro, RJ", salary: "R$ 14k-20k" },
  { title: "React Developer", company: "WebStudio", location: "Belo Horizonte, MG", salary: "R$ 11k-16k" },
];

export default function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {jobs.map((job, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {job.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {job.company}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                <DollarSign className="w-3 h-3" />
                <span>{job.salary}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

