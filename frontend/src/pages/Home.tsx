import vnrCampus from "@/assets/vnr-campus.jpg";

const Home = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-vnr-blue-muted/10 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Description */}
          <div className="space-y-8 vnr-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Register Your Vehicle
                <span className="text-vnr-blue block">Easily & Quickly</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Register your vehicle details for the VNR VJIET parking system.
                Quick and easy registration process designed specifically for students and faculty.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-white bg-vnr-blue hover:bg-vnr-blue-dark rounded-xl shadow-vnr hover:shadow-xl transition-all duration-300 vnr-hover-lift"
              >
                Login to Register
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-vnr-blue bg-vnr-blue-muted hover:bg-vnr-blue-muted/80 rounded-xl border border-vnr-blue/20 hover:border-vnr-blue/40 transition-all duration-300"
              >
                Register Vehicle
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-muted-foreground bg-background hover:bg-background/80 rounded-xl border border-border hover:border-border/40 transition-all duration-300"
              >
                Get Support
              </a>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8">
              <div className="text-center space-y-2">
                <div className="w-10 md:w-12 h-10 md:h-12 mx-auto bg-vnr-blue/10 rounded-lg flex items-center justify-center">
                  📝
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">Quick Register</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Register vehicles in seconds</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 md:w-12 h-10 md:h-12 mx-auto bg-vnr-blue/10 rounded-lg flex items-center justify-center">
                  🚗
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">All Vehicle Types</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Support for cars, bikes, and EVs</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 md:w-12 h-10 md:h-12 mx-auto bg-vnr-blue/10 rounded-lg flex items-center justify-center">
                  ⚡
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">EV Support</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Special EV vehicle tracking</p>
              </div>
            </div>
          </div>

          {/* Right side - Campus Image */}
          <div className="vnr-slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-large">
              <img
                src={vnrCampus}
                alt="VNR VJIET Campus"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vnr-blue/20 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-vnr-blue/5 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-vnr-blue">500+</div>
              <div className="text-sm md:text-base text-muted-foreground">Registered Vehicles</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-vnr-blue">24/7</div>
              <div className="text-sm md:text-base text-muted-foreground">System Availability</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-vnr-blue">50+</div>
              <div className="text-sm md:text-base text-muted-foreground">EV Vehicles</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-vnr-blue">100%</div>
              <div className="text-sm md:text-base text-muted-foreground">Secure System</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
