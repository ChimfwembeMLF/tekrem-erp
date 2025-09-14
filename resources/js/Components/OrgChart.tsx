import React from "react";
import { Linkedin, Github, Twitter, Facebook } from "lucide-react";

interface SocialLink {
  platform: "linkedin" | "github" | "twitter" | "facebook";
  url: string;
}

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  bio?: string;
  color: string; // Tailwind gradient classes like "from-blue-500 to-purple-600"
  image?: string;
  socials?: SocialLink[];
  children?: TeamMember[];
}

interface TeamCardProps extends TeamMember {}

const TeamCard: React.FC<TeamCardProps> = ({
  name,
  initials,
  role,
  bio,
  color,
  image,
  socials,
}) => (
  <div className="bg-white dark:bg-primary/40 rounded-lg shadow-lg p-6 max-w-sm transition hover:shadow-xl hover:-translate-y-1 duration-200">
    <div className="flex flex-col items-center">
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-32 w-32 rounded-lg object-cover mb-4 border-2 border-secondary dark:border-secondary/60"
        />
      ) : (
        <div
          className={`h-20 w-20 rounded-full bg-gradient-to-r ${color} flex items-center justify-center mb-4`}
        >
          <span className="text-white font-bold text-2xl">{initials}</span>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {name}
      </h3>
      <p className="text-blue-600 font-medium text-sm">{role}</p>
      {bio && (
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 text-center">
          {bio}
        </p>
      )}

      {/* Social icons */}
      {socials && socials.length > 0 && (
        <div className="flex space-x-3 mt-4">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
              title={s.platform}
            >
              {s.platform === "linkedin" && (
                <Linkedin className="w-5 h-5 text-blue-600" />
              )}
              {s.platform === "github" && (
                <Github className="w-5 h-5 text-gray-800 dark:text-white" />
              )}
              {s.platform === "twitter" && (
                <Twitter className="w-5 h-5 text-sky-500" />
              )}
              {s.platform === "facebook" && (
                <Facebook className="w-5 h-5 text-blue-700" />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  </div>
);

interface OrgChartProps {
  data: TeamMember[]; // Now accepts an array since you said no CEO
}

const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {data.map((person, i) => (
          <div key={i} className="flex justify-center">
            <TeamCard {...person} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
