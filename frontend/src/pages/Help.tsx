import { Phone, Mail } from "lucide-react";
import securityHead from "@/assets/security-head.jpg";
import appSupporter from "@/assets/app-supporter.jpg";
import adminOfficer from "@/assets/admin-officer.jpg";

const Help = () => {
  const contactPeople = [
    {
      name: "Rajesh Kumar Sharma",
      role: "Head of Security",
      phone: "+91 9876543210",
      email: "security.head@vnrvjiet.in",
      image: securityHead,
      description: "Campus security and vehicle management"
    },
    {
      name: "Priya Reddy",
      role: "Application Supporter",
      phone: "+91 9876543211",
      email: "app.support@vnrvjiet.in",
      image: appSupporter,
      description: "Technical support and app assistance"
    },
    {
      name: "Dr. Venkata Rao",
      role: "Administrative Officer",
      phone: "+91 9876543212",
      email: "admin.officer@vnrvjiet.in",
      image: adminOfficer,
      description: "Administrative queries and policy matters"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 vnr-fade-in">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Need Help?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team is here to assist you with parking management, 
            technical issues, and administrative queries. Reach out to us anytime.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {contactPeople.map((person, index) => (
            <div 
              key={index} 
              className="vnr-card-gradient rounded-2xl shadow-large p-6 text-center vnr-hover-lift vnr-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-vnr-blue/20">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-vnr-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {person.name}
                  </h3>
                  <p className="text-vnr-blue font-semibold">
                    {person.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {person.description}
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <a
                    href={`tel:${person.phone}`}
                    className="flex items-center justify-center space-x-3 p-3 bg-vnr-blue/5 hover:bg-vnr-blue/10 rounded-lg transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 text-vnr-blue" />
                    <span className="font-medium text-foreground">
                      {person.phone}
                    </span>
                  </a>
                  
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center justify-center space-x-3 p-3 bg-vnr-blue/5 hover:bg-vnr-blue/10 rounded-lg transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 text-vnr-blue" />
                    <span className="font-medium text-foreground text-sm">
                      {person.email}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 text-center vnr-fade-in">
          <div className="vnr-card-gradient rounded-2xl shadow-large p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Quick Help Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-vnr-blue">
                  For Vehicle Registration Issues:
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Contact Application Supporter for technical help</li>
                  <li>• Ensure all required fields are filled correctly</li>
                  <li>• Use valid vehicle number format (e.g., TS09EA1234)</li>
                  <li>• Provide accurate contact information</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-vnr-blue">
                  For Security & Parking Queries:
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Contact Head of Security for parking violations</li>
                  <li>• Report lost or stolen parking passes</li>
                  <li>• Inquire about special parking arrangements</li>
                  <li>• Emergency vehicle access requests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Help;