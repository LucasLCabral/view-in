import { FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon, Briefcase, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Globe } from "@/components/ui/globe";
import { Orb } from "@/components/ui/orb";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";

const reports = [
  {
    name: "Performance Report - Jan 2024",
    body: "Complete analysis of your performance in technical interviews. 35% improvement in clarity and 28% in confidence.",
  },
  {
    name: "Interview Analysis - Dec 2023",
    body: "Detailed report on your behavioral responses. Strengths identified in leadership and communication.",
  },
  {
    name: "Progress Summary - Nov 2023",
    body: "Monthly evolution of your progress. 12 interviews practiced, average of 8.5/10 in overall feedback.",
  },
  {
    name: "Skills Assessment - Oct 2023",
    body: "Assessment of your technical competencies. Strong in React and TypeScript, areas for improvement in algorithms.",
  },
  {
    name: "Feedback Report - Sep 2023",
    body: "Consolidation of received feedback. Positive trend in all main evaluation metrics.",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Performance Reports",
    description: "Track your progress with detailed reports and comprehensive analyses.",
    href: "#",
    cta: "View reports",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {reports.map((report, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">
                  {report.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{report.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: "Available Jobs",
    description: "Receive notifications about new job opportunities that match your profile.",
    href: "#",
    cta: "View jobs",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90">
        <AnimatedList delay={1500} className="h-full">
          {[
            { title: "Software Engineer", company: "Tech Corp", location: "São Paulo, SP", salary: "R$ 12k-18k" },
            { title: "Frontend Developer", company: "StartupXYZ", location: "Remote", salary: "R$ 10k-15k" },
            { title: "Full Stack Engineer", company: "DevCompany", location: "Rio de Janeiro, RJ", salary: "R$ 14k-20k" },
            { title: "React Developer", company: "WebStudio", location: "Belo Horizonte, MG", salary: "R$ 11k-16k" },
          ].map((job, idx) => (
            <AnimatedListItem key={idx}>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 w-full">
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
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>
    ),
  },
  {
    Icon: Share2Icon,
    name: "How It Works",
    description: "Our platform integrates advanced AI to provide real-time feedback during your practice sessions.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out overflow-hidden">
        <Orb className="w-full h-full" />
      </div>
    ),
  },
  {
    Icon: MapPin,
    name: "Prepare yourself to work anywhere",
    description: "Work from anywhere in the world. Our platform prepares you for global opportunities.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Explore",
    background: (
      <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out overflow-hidden">
        <div className="w-[300px] h-[300px]">
          <Globe />
        </div>
      </div>
    ),
  },
];

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}

