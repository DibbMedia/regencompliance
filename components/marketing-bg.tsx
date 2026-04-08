export function MarketingBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0a0a0a] to-[#0a0a0a]" />
      <div className="absolute -top-[200px] left-[10%] w-[400px] sm:w-[600px] lg:w-[900px] h-[300px] sm:h-[400px] lg:h-[600px] rounded-full bg-[#55E039]/[0.15] blur-[150px]" />
      <div className="absolute top-[30%] -right-[100px] w-[250px] sm:w-[350px] lg:w-[500px] h-[250px] sm:h-[350px] lg:h-[500px] rounded-full bg-[#55E039]/[0.10] blur-[120px]" />
      <div className="absolute top-[60%] -left-[200px] w-[300px] sm:w-[400px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[400px] rounded-full bg-[#89E3E4]/[0.08] blur-[130px]" />
      <div className="absolute bottom-[10%] right-[20%] w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] rounded-full bg-[#55E039]/[0.07] blur-[100px]" />
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(85,224,57,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(85,224,57,0.12) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle, rgba(85,224,57,0.25) 1.5px, transparent 1.5px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(10,10,10,0.4) 70%, rgba(10,10,10,0.9) 100%)"
      }} />
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] rounded-full border border-[#55E039]/[0.08]" />
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] rounded-full border border-[#55E039]/[0.06]" />
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] rounded-full border border-[#55E039]/[0.12]" />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
    </div>
  )
}
