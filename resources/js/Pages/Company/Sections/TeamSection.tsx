import React from 'react';

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

interface Props {
  team: TeamMember[];
}

const TeamSection: React.FC<Props> = ({ team }) => (
  <section className="team-section py-16">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Meet the Team</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {team.map((member, idx) => (
          <div key={idx} className="p-6 bg-white rounded shadow text-center">
            {member.avatar && <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-4" />}
            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
            <div className="text-primary mb-2">{member.role}</div>
            {member.bio && <p className="text-gray-600 text-sm">{member.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
