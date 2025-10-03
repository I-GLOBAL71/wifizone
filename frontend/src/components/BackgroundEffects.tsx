const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient sacré de fond */}
      <div className="absolute inset-0 bg-gradient-sacred opacity-90" />
      
      {/* Particules lumineuses animées */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gold-warm/20 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: "0s" }} />
      <div className="absolute top-40 right-20 w-40 h-40 bg-violet-light/20 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-emerald-bright/15 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gold-light/20 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: "3s" }} />
      
      {/* Grille subtile */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
};

export default BackgroundEffects;
